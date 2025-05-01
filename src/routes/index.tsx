import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import PathURL from '@/core/class/PathURL';
import LoadingPage from '@/core/components/LoadingPage';
import DefaultLayout from '@/core/layout/DefaultLayout';
import PageNotFound from '@/modules/Authentication/pages/PageNotFound';
import JobTemplateFormPage from '@/modules/System/pages/JobTemplateForm';
import JobTemplatePage from '@/modules/System/pages/JobTemplate';

const Loadable = (Component: React.FC) => {
  const LoadableComponent = (props: any) => {
    return (
      <React.Suspense fallback={<LoadingPage />}>
        <Component {...props} />
      </React.Suspense>
    );
  };
  return LoadableComponent;
};

export default function Router() {
  return useRoutes([
    {
      path: PathURL.login,
      element: <LoginPage />
    },
    {
      path: '/',
      element: <DefaultLayout />,
      children: [
        {
          index: true,
          element: <Navigate to={`/${PathURL.dashboard}`} replace />
        },
        {
          path: PathURL.dashboard,
          element: <DashboardPage />
        },
        {
          path: PathURL.projects,
          element: <ProjectPage />
        },
        {
          path: `${PathURL.projects}/:projectId`,
          element: <DetailJob />
        },
        {
          path: `${PathURL.projects}/:projectId/jobs/:id`,
          element: <EditNewJob />
        },
        {
          path: PathURL.jobs,
          element: <JobListPage />
        },
        {
          path: `${PathURL.jobs}/add`,
          element: <JobFormPage />
        },
        {
          path: `${PathURL.jobs}/edit/:id`,
          element: <JobFormPage />
        },
        {
          path: `${PathURL.jobs}/:id`,
          element: <JobDetailPage />
        },
        {
          path: `${PathURL.projects}/:projectId/${PathURL.jobs}/:jobId/${PathURL.milestones}/:milestoneId/${PathURL.tasks}/:id/`,
          element: <JobTaskFormPage />
        },
        {
          path: PathURL.employees,
          element: <EmployeeListPage />
        },
        {
          path: `${PathURL.employees}/add`,
          element: <EmployeeFormPage />
        },
        {
          path: `${PathURL.employees}/edit/:id`,
          element: <EmployeeFormPage />
        },
        {
          path: `${PathURL.employees}/:id`,
          element: <EmployeeDetailPage />
        },
        {
          path: PathURL.teams,
          element: <TeamPage />
        },
        {
          path: PathURL.customers,
          element: <CustomerPage />
        },
        {
          path: PathURL.sitelocations,
          element: <SitelocationListPage />
        },
        {
          path: `${PathURL.sitelocations}/add`,
          element: <SitelocationFormPage />
        },
        {
          path: `${PathURL.sitelocations}/edit/:id`,
          element: <SitelocationFormPage />
        },
        {
          path: PathURL.markets,
          element: <MarketPage />
        },
        {
          path: PathURL.contact,
          element: <ContactPage />
        },
        {
          path: PathURL.equipments,
          element: <EquipmentPage />
        },
        {
          path: PathURL.documents,
          element: <DocumentPage />
        },
        {
          path: PathURL.profile,
          element: <ProfilePage />
        },
        {
          path: PathURL.taskTemplates,
          element: <TaskTemplateListPage />
        },
        {
          path: `${PathURL.taskTemplates}/add`,
          element: <TaskTemplateFormPage />
        },
        {
          path: `${PathURL.taskTemplates}/edit/:id`,
          element: <TaskTemplateFormPage />
        },
        {
          path: PathURL.jobTemplates,
          element: <JobTemplatePage />
        },
        {
          path: `${PathURL.jobTemplates}/add`,
          element: <JobTemplateFormPage />
        },
        {
          path: `${PathURL.jobTemplates}/edit/:id`,
          element: <JobTemplateFormPage />
        },
        {
          path: `${PathURL.certificate}`,
          element: <CertificatePage />
        }
      ]
    },
    {
      path: PathURL.pageNotFound,
      element: <PageNotFound />
    },
    {
      path: '*',
      element: <Navigate to={`/${PathURL.pageNotFound}`} replace />
    }
  ]);
}

const LoginPage = Loadable(React.lazy(() => import('@/modules/Authentication/pages/Login')));

const DashboardPage = Loadable(React.lazy(() => import('@/modules/System/pages/Dashboard')));

const ProjectPage = Loadable(React.lazy(() => import('@/modules/System/pages/Projects/ProjectList')));

const JobListPage = Loadable(React.lazy(() => import('@/modules/System/pages/Jobs/JobList')));

const JobFormPage = Loadable(React.lazy(() => import('@/modules/System/pages/Jobs/JobForm')));

const JobDetailPage = Loadable(React.lazy(() => import('@/modules/System/pages/Jobs/JobDetail')));

const EmployeeListPage = Loadable(React.lazy(() => import('@/modules/System/pages/Employees/EmployeeList')));

const EmployeeFormPage = Loadable(React.lazy(() => import('@/modules/System/pages/Employees/EmployeeForm')));

const EmployeeDetailPage = Loadable(React.lazy(() => import('@/modules/System/pages/Employees/EmployeeDetail')));

const TeamPage = Loadable(React.lazy(() => import('@/modules/System/pages/Teams')));

const CustomerPage = Loadable(React.lazy(() => import('@/modules/System/pages/Customers')));

const SitelocationListPage = Loadable(
  React.lazy(() => import('@/modules/System/pages/Sitelocations/SitelocationList'))
);

const SitelocationFormPage = Loadable(
  React.lazy(() => import('@/modules/System/pages/Sitelocations/SitelocationForm'))
);

const MarketPage = Loadable(React.lazy(() => import('@/modules/System/pages/Markets')));

const ContactPage = Loadable(React.lazy(() => import('@/modules/System/pages/Contact')));

const EquipmentPage = Loadable(React.lazy(() => import('@/modules/System/pages/Equipments')));

const DocumentPage = Loadable(React.lazy(() => import('@/modules/System/pages/Documents')));

const ProfilePage = Loadable(React.lazy(() => import('@/modules/System/pages/Profile')));

const TaskTemplateListPage = Loadable(React.lazy(() => import('@/modules/System/pages/TaskTemplate/TaskTemplateList')));

const TaskTemplateFormPage = Loadable(React.lazy(() => import('@/modules/System/pages/TaskTemplate/TaskTemplateForm')));

const JobTaskFormPage = Loadable(React.lazy(() => import('@/modules/System/pages/JobTask/JobTaskForm')));

const DetailJob = Loadable(React.lazy(() => import('@/modules/System/pages/Projects/DetailJob')));

const EditNewJob = Loadable(React.lazy(() => import('@/modules/System/pages/Projects/EditJob')));

const CertificatePage = Loadable(React.lazy(() => import('@/modules/System/pages/Certificate')));
