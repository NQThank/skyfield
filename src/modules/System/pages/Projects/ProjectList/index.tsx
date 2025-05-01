import { faArrowRight, faEllipsisH, faLocationDot, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Card, Dropdown, Empty, List, MenuProps, Skeleton } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import ApiURL from '@/core/class/ApiURL';
import { AppButton } from '@/core/components';
import { PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { ProjectService } from '@/core/services';
import { ActionType, Project } from '@/core/types';
import { FormatHelper, LogHelper, ModalHelper } from '@/utils/helpers';
import { ProjectModal } from '../components';

const ProjectList = () => {
  const { t } = useTranslation(['button', 'message']);
  const [open, setOpen] = useState(false);
  const [dataSelected, setDataSelected] = useState<Project>();
  const [actionType, setActionType] = useState<ActionType>();

  const { data, fetchData, loading } = useData<Project>(ApiURL.project, { page_number: 1, page_size: 1000 });
  const { isEmployee } = useRole();

  useEffect(() => {
    if (!open) {
      setDataSelected(undefined);
      setActionType(undefined);
    }
  }, [open]);

  const handleEdit = useCallback((project: Project) => {
    setActionType('edit');
    setDataSelected(project);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    (project: Project) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'project' }),
        async onOk() {
          try {
            const res = await ProjectService.deleteProject(project.id);
            if (res.success) {
              toast.success(t(['message:success']));
              fetchData();
            }
          } catch (error) {
            LogHelper.logError(error);
          }
        }
      });
    },
    [fetchData, t]
  );

  return (
    <>
      <MainLayout
        title={PathLabelEnum.projects}
        actions={
          !isEmployee && (
            <AppButton
              size="large"
              type="primary"
              ghost
              iconType="add"
              onClick={() => {
                setOpen(true);
                setActionType('add');
              }}
            >
              {t(['add_project'])}
            </AppButton>
          )
        }
      >
        {loading && (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 4, xxl: 5 }}
            dataSource={Array(4).fill(1)}
            renderItem={() => (
              <List.Item>
                <ProjectItemSkeleton />
              </List.Item>
            )}
          />
        )}
        {!loading &&
          (data.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 4, xxl: 4 }}
              dataSource={data}
              renderItem={(item) => (
                <List.Item>
                  <ProjectItem data={item} onEdit={handleEdit} onDelete={handleDelete} />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No project" />
          ))}
      </MainLayout>
      <ProjectModal
        open={open}
        onCancel={() => setOpen(false)}
        actionType={actionType}
        fetchData={fetchData}
        data={dataSelected}
      />
    </>
  );
};

export default ProjectList;

type ProjectItemProps = {
  data: Project;
  onEdit: (data: Project) => void;
  onDelete: (data: Project) => void;
};

const ProjectItem: React.FC<ProjectItemProps> = ({ data, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const items = useMemo<MenuProps['items']>(
    () => [
      {
        label: <span className="mt-1">Edit</span>,
        icon: <FontAwesomeIcon icon={faPenToSquare} />,
        key: 'edit'
      },
      {
        label: <span className="mt-1">Delete</span>,
        icon: <FontAwesomeIcon icon={faTrash} color="red" />,
        key: 'delete'
      }
    ],
    []
  );

  const handleClickItem: MenuProps['onClick'] = (e) => {
    if (e.key === 'edit') {
      onEdit(data);
    } else if (e.key === 'delete') onDelete(data);
  };
  const handleClickCard = () => {
    navigate(`/projects/${data.id}`);
  };

  return (
    <Card
      className="cursor-pointer"
      title={data.name}
      styles={{
        header: {
          borderBottomWidth: 0
        },
        body: {
          paddingTop: 0,
          paddingBottom: 6
        }
      }}
      extra={
        <Dropdown menu={{ items: items, onClick: handleClickItem }} placement="bottomRight" trigger={['click']}>
          <AppButton icon={<FontAwesomeIcon icon={faEllipsisH} />} type="text" shape="circle" />
        </Dropdown>
      }
    >
      <div onClick={handleClickCard}>
        <div className="flex flex-wrap items-center gap-x-4">
          <div className="flex items-center">
            <Avatar className="bg-teal-500">{data.customer_name.charAt(0)}</Avatar>
            <span className="ml-2 inline-block">{data.customer_name}</span>
            {data.market_name && (
              <div className="ml-4">
                <i className="fa-solid fa-shop mr-2" />
                <span className="">{data.market_name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="italic">
            <span className="">{FormatHelper.formatDate(data.forecast_start_date)}</span>
            <FontAwesomeIcon icon={faArrowRight} size="1x" className="mx-2 " />
            <span className="">{FormatHelper.formatDate(data.forecast_end_date)}</span>
          </div>
        </div>
        <div className="line-clamp-2 h-12 ">{data.description}</div>
      </div>
    </Card>
  );
};

const ProjectItemSkeleton = () => {
  return (
    <Card>
      <Skeleton active paragraph={{ rows: 2 }} />
    </Card>
  );
};
