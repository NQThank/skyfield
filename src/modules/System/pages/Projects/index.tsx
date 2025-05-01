import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton } from '@/core/components';
import { DateFormat, PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { ProjectService } from '@/core/services';
import { ActionType, Project } from '@/core/types';
import { FormatHelper, LogHelper, ModalHelper } from '@/utils/helpers';
import { ProjectModal } from './components';
import { Card, Col, Row, Typography } from 'antd';
import { Link } from 'react-router-dom';

const Projects = () => {
  const { t } = useTranslation(['button', 'message']);
  const [open, setOpen] = useState(false);
  const [dataSelected, setDataSelected] = useState<Project>();
  const [actionType, setActionType] = useState<ActionType>();

  const { data, fetchData } = useData<Project>(ApiURL.project);
  const { isEmployee } = useRole();

  useEffect(() => {
    if (!open) {
      setDataSelected(undefined);
      setActionType(undefined);
    }
  }, [open]);

  const onEdit = useCallback((project: Project) => {
    setActionType('edit');
    setDataSelected(project);
    setOpen(true);
  }, []);

  const onDelete = useCallback(
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
        <Row gutter={[24, 24]}>
          {data.map((item) => (
            <Col xxl={6} xl={6} key={item.id}>
              <Card
                title={item.name}
                extra={
                  <div>
                    <AppButton
                      type="link"
                      iconType="edit"
                      onClick={() => {
                        onEdit(item);
                      }}
                    />
                    <AppButton
                      type="link"
                      iconType="delete"
                      onClick={() => {
                        onDelete(item);
                      }}
                    />
                  </div>
                }
              >
                <Link to={`/projects/${item.id}`}>
                  <Typography className="flex">
                    <div className="w-20">Date</div>
                    <span>
                      {`: ${FormatHelper.formatDate(
                        item.forecast_start_date,
                        DateFormat['MM/DD/YYYY']
                      )} ~ ${FormatHelper.formatDate(item.forecast_end_date, `MM/DD/YYYY`)}`}
                    </span>
                  </Typography>
                  <Typography className="flex">
                    <div className="w-20">Customer</div>
                    <span>{`: ${item.customer_name}`}</span>
                  </Typography>
                  <Typography className="flex">
                    <div className="w-20">Market type</div>
                    <span>{`: Market type`}</span>
                  </Typography>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
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

export default Projects;
