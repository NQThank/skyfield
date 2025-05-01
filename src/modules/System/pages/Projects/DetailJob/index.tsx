import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, InfoWindow, Libraries, Marker, useJsApiLoader } from '@react-google-maps/api';
import { toast } from 'sonner';

import { AppButton, AppTable, PageFilter } from '@/core/components';
import { PathLabelEnum } from '@/core/enums';
import { useAppDispatch, useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { JobService, ProjectService } from '@/core/services';
import { Action, CalendarRef, Job } from '@/core/types';

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};
import ApiURL from '@/core/class/ApiURL';
import { LogHelper, ModalHelper } from '@/utils/helpers';
import BookingDate from './BookingDate';
import { customerNameCol, endDateCol, priorityDateCol, startDateCol, statusCol, teamCol } from './columns';
import ModalJobDetail from './ModalJobDetail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Radio, Typography } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import { filtersNewJob } from '@/core/constants';
import PathURL from '@/core/class/PathURL';
import ModalForm from '../EditJob/component/ModalForm';
import { setNameMap } from '../../common.slice';

type MarkerCustomProps = {
  placeDuplicate: Place[];
  handleMarkerClick: (place: Place) => void;
  setSelectedPlace: (place: Place) => void;
  placeItem: any;
  selectedPlace: Place | null;
};
type LocationType = { id: string; name: string; latitude: number; longitude: number };
const getNextItem = (array: any[], id: string) => {
  const index = array.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const nextIndex = (index + 1) % array.length;
  return array[nextIndex];
};
const MarkerCustom = React.memo(
  ({ selectedPlace, placeDuplicate, placeItem, handleMarkerClick, setSelectedPlace }: MarkerCustomProps) => {
    const [placeItemRender, setPlaceItemRender] = useState<any>(
      placeDuplicate.length > 1 ? placeDuplicate[0] : placeItem
    );

    const handleSpanClick = () => {
      if (placeDuplicate.length > 1) {
        const nextPlace = getNextItem(placeDuplicate, placeItemRender.id);
        setPlaceItemRender(nextPlace);
        setSelectedPlace(nextPlace);
      }
    };

    return (
      <>
        <Marker
          position={{ lat: Number(placeItemRender.lat), lng: Number(placeItemRender.lng) }}
          onClick={() => handleMarkerClick(placeItemRender)}
          onMouseOver={() => setSelectedPlace(placeItemRender)}
          label={
            placeDuplicate.length > 1
              ? {
                  text: `${placeDuplicate.length}`,
                  color: 'white',
                  fontSize: '12px'
                }
              : undefined
          }
        >
          {selectedPlace === placeItemRender && (
            <InfoWindow>
              <span className={`${placeDuplicate.length > 1 && 'cursor-pointer'} text-base `} onClick={handleSpanClick}>
                {placeItemRender?.name}
              </span>
            </InfoWindow>
          )}
        </Marker>
      </>
    );
  }
);
MarkerCustom.displayName = 'MarkerCustom';

const containerStyle: React.CSSProperties = { height: '70vh', borderRadius: 4 };
const zoom = 15;
const libraries: Libraries = ['places'];

const DetailJob = () => {
  const { projectId } = useParams();
  const { t } = useTranslation(['button', 'message']);
  const { data, loading, pagination, fetchData } = useData<Job>(ApiURL.job, { project_id: projectId });
  const { isEmployee } = useRole();
  const navigate = useNavigate();
  const calendarRef = useRef<CalendarRef>(null);
  const [actionType, setActionType] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedJob, setSelectJob] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [place, setPlace] = useState<Place[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useAppDispatch();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY!,
    libraries,
    language: 'en'
  });

  useEffect(() => {
    const listMap: Place[] = [];
    if (data) {
      data.forEach(
        (job: Job) =>
          Array.isArray(job?.site_location) &&
          job?.site_location.forEach((location: LocationType) => {
            listMap.push({ id: job.id, name: job.name, lat: location.latitude, lng: location.longitude });
          })
      );
      setPlace(listMap);
    }
  }, [data]);
  useEffect(() => {
    if (projectId) fetchDataProject();
  }, [projectId]);
  const fetchDataProject = async () => {
    try {
      const { success, data } = await ProjectService.getProjectById(projectId || '');

      if (success && data) {
        dispatch(setNameMap({ [projectId as string]: data?.name }));
      }
    } catch (error) {
      LogHelper.logError(error);
    }
  };

  const handleOpenDetailJob = useCallback(
    (id: string) => {
      setSelectJob(data.find((item) => item.id === id)?.id || null);
      setOpen(true);
    },
    [data]
  );
  const handleMarkerClick = useCallback(
    (place: Place) => {
      setSelectedPlace(place);
      if ('id' in place) {
        handleOpenDetailJob(place.id as string);
      }
    },
    [handleOpenDetailJob]
  );

  const handleMapClick = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  const columns = useMemo(
    () => [
      {
        title: 'Job Name',
        key: 'name',
        dataIndex: 'name',
        render: (name: string, record: Job) => {
          return (
            <span onClick={() => handleOpenDetailJob(record.id)} className="cursor-pointer text-blue-600">
              {name}
            </span>
          );
        }
      },
      customerNameCol,
      statusCol,
      teamCol,
      startDateCol,
      endDateCol,
      priorityDateCol
    ],
    [handleOpenDetailJob]
  );

  const onEdit = useCallback(
    (record: Job) => {
      navigate(`/${PathURL.projects}/${projectId}/jobs/${record.id}`);
    },
    [projectId, navigate]
  );

  const onDelete = useCallback(
    (job: Job) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'job' }),
        async onOk() {
          try {
            const res = await JobService.deleteJob(job.id);
            if (res.success && fetchData) {
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

  const actions = useMemo<Action[]>(
    () => [
      { type: 'edit', label: t(['edit']), callback: onEdit },
      { type: 'delete', label: t(['delete']), callback: onDelete }
    ],
    [t, onEdit, onDelete]
  );

  const listRender = useMemo(
    () => [
      <AppTable
        key={1}
        columns={columns}
        dataSource={data}
        loading={loading}
        {...pagination}
        actions={actions}
        showToggleColumn
      />,
      <BookingDate key="calendar" data={data || []} ref={calendarRef} handleOpenDetailJob={handleOpenDetailJob} />,
      <GoogleMap
        key="map"
        mapContainerStyle={containerStyle}
        center={place[0] || []}
        zoom={zoom}
        onClick={handleMapClick}
      >
        {isLoaded &&
          place.map((placeItem: Place, index) => {
            const placeDuplicate = place.filter((e: Place) => e.lat === placeItem.lat && e.lng === placeItem.lng) || [];
            return (
              <MarkerCustom
                key={index}
                placeDuplicate={placeDuplicate}
                handleMarkerClick={handleMarkerClick}
                setSelectedPlace={setSelectedPlace}
                placeItem={placeItem}
                selectedPlace={selectedPlace}
              />
            );
          })}
      </GoogleMap>
    ],
    [
      actions,
      columns,
      data,
      handleMapClick,
      handleMarkerClick,
      handleOpenDetailJob,
      isLoaded,
      loading,
      pagination,
      place,
      selectedPlace
    ]
  );
  const optionsWithDisabled = [
    {
      label: (
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={['fas', 'table']}
            onClick={() => setActionType(2)}
            className={`cursor-pointer text-xl ${actionType === 0 ? 'text-white' : 'text-blue-500'}`}
          />
          <span>List</span>
        </div>
      ),
      value: 0
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={['fas', 'map-location-dot']}
            onClick={() => setActionType(0)}
            className={`cursor-pointer text-xl ${actionType === 2 ? 'text-white' : 'text-blue-500'}`}
          />
          <span>Map</span>
        </div>
      ),
      value: 2
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={['fas', 'calendar-days']}
            onClick={() => setActionType(1)}
            className={`cursor-pointer text-xl ${actionType === 1 ? 'text-white' : 'text-blue-500'}`}
          />
          <span>Calendar</span>
        </div>
      ),
      value: 1
    }
  ];
  const changeType = ({ target: { value } }: RadioChangeEvent) => {
    setActionType(value);
  };
  const onCancel = () => {
    setOpenModal(false);
  };
  return (
    <>
      <MainLayout
        title={PathLabelEnum.jobs}
        actions={
          <div className="flex gap-x-2">
            <div className="mr-5 flex items-center gap-x-2">
              <Radio.Group
                options={optionsWithDisabled}
                onChange={changeType}
                value={actionType}
                optionType="button"
                buttonStyle="solid"
              />
            </div>
            {!isEmployee && (
              <AppButton size="large" type="primary" ghost iconType="add" onClick={() => setOpenModal(true)}>
                {t(['add_job'])}
              </AppButton>
            )}
          </div>
        }
      >
        <div className="mb-4">
          <PageFilter filters={filtersNewJob} screen="jobs" showMoreFilter={false} />
        </div>

        {listRender[actionType]}
        <ModalJobDetail id={selectedJob} open={open} setOpen={setOpen} />
      </MainLayout>
      <Modal
        className="modalform__custom"
        title={<Typography.Title level={3}>Add Information Job</Typography.Title>}
        open={openModal}
        onCancel={onCancel}
        footer={null}
      >
        <ModalForm onCancel={onCancel} fetchData={fetchData} />
      </Modal>
    </>
  );
};

export default React.memo(DetailJob);
