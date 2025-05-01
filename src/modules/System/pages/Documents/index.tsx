import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { filtersDocuments } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { Action, ActionType, Equipment } from '@/core/types';
import { LogHelper, ModalHelper } from '@/utils/helpers';
import DocumentModal from './components/DocumentModal';
import documentService from '@/core/services/document.service';
import { toast } from 'sonner';

const Documents = () => {
  const { t } = useTranslation(['button', 'message']);

  const [actionType, setActionType] = useState<ActionType>();
  const [dataSelected, setDataSelected] = useState<Equipment>();
  const [isOpen, setIsOpen] = useState(false);

  const { data, loading, pagination, fetchData } = useData<Equipment>(ApiURL.document);
  const { isEmployee } = useRole();

  useEffect(() => {
    if (!isOpen) {
      setDataSelected(undefined);
      setActionType(undefined);
    }
  }, [isOpen]);

  const onDownload = useCallback((document: any) => {
    window.open(`${process.env.REACT_APP_BASE_URL}/files/download?file_path=${document.id}`);
  }, []);

  const onDelete = useCallback(
    (document: any) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'document' }),
        async onOk() {
          try {
            const res = await documentService.deleteDocument(document.id);
            if (res.success) {
              toast.success(t('message:success'));
              fetchData();
            }
          } catch (error) {
            LogHelper.logError(error);
          }
        }
      });
    },
    [t]
  );

  const actions = useMemo<Action[]>(() => {
    if (isEmployee) return [];
    return [
      { label: t(['button:download']), callback: onDownload, type: 'download' },
      { label: t(['button:delete']), callback: onDelete, type: 'delete' }
    ];
  }, [isEmployee, t, onDownload, onDelete]);

  const columns = useMemo<ColumnsType<Equipment>>(() => {
    return [
      {
        title: 'Document Name',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        ellipsis: true
      },
      {
        title: 'File Type',
        dataIndex: 'type',
        key: 'type',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        width: 200,
        ellipsis: true,
        render: (size: number) => `${size || 0} KB`
      }
    ];
  }, []);

  return (
    <>
      <MainLayout
        title={PathLabelEnum.documents}
        actions={
          !isEmployee && (
            <AppButton
              size="large"
              type="primary"
              ghost
              iconType="add"
              onClick={() => {
                setIsOpen(true);
                setActionType('add');
              }}
            >
              {t(['add_document'])}
            </AppButton>
          )
        }
        filter={<PageFilter filters={filtersDocuments} />}
      >
        <AppTable dataSource={data} loading={loading} columns={columns} actions={actions} {...pagination} />
      </MainLayout>
      <DocumentModal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        actionType={actionType}
        data={dataSelected}
        fetchData={fetchData}
      />
    </>
  );
};

export default Documents;
