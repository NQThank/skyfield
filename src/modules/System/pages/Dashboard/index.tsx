import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, OverlayView, useJsApiLoader, Libraries, InfoWindow } from '@react-google-maps/api';
import { Select, Table, Image, Form, Radio, Button } from 'antd';
import { DataHelper } from '@/utils/helpers';
import { DashboardService } from '@/core/services';
import { AppFormItem } from '@/core/components';
import { FormLayoutItem } from '@/core/types';
import { Helmet } from 'react-helmet';
import { APP_NAME } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import CardList from './components/CardList';
const people = [
  {
    id: 1,
    name: 'John Doe',
    lat: 10.7628,
    lng: 106.6605,
    avatar: 'https://gravatar.com/avatar/89c670f834f8c98da8be49c1a4358a40?s=400&d=robohash&r=x',
    info: 'Engineer',
    status: 'active',
    email: 'john@gmail.com',
    phone: '0123456789'
  },
  {
    id: 2,
    name: 'Jane Smith',
    lat: 10.7625,
    lng: 106.6602,
    avatar: 'https://as2.ftcdn.net/jpg/03/85/50/01/1000_F_385500115_T8QiYsPeliQ5tE3npwOuJNUfunqFBo1U.jpg',
    info: 'Designer'
  },
  {
    id: 3,
    name: 'Alice Brown',
    lat: 10.7627,
    lng: 106.6604,
    avatar:
      'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
    info: 'Manager'
  },
  {
    id: 4,
    name: 'Bob Johnson',
    lat: 10.7626,
    lng: 106.6603,
    avatar:
      'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
    info: 'Developer'
  },
  {
    id: 5,
    name: 'Charlie White',
    lat: 10.7624,
    lng: 106.6601,
    avatar:
      'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
    info: 'Analyst'
  },
  {
    id: 6,
    name: 'Emily Davis',
    lat: 10.7629,
    lng: 106.6606,
    avatar:
      'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
    info: 'HR'
  }
];

type SiteLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type User = {
  id: string;
  full_name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: string;
  avatar?: string | null;
};

type Job = {
  id: string;
  name: string; // Added the 'name' property
  site_locations: SiteLocation[];
  users: User[];
};

type MappedData = {
  id: string;
  name: string;
  site_location: SiteLocation;
  jobs: {
    id: string;
    name: string;
    users: User[];
  }[];
};

// Utility function to map data by site location
const mapDataBySiteLocation = (data: Job[]): MappedData[] => {
  const siteLocationMap: Record<string, MappedData> = {};

  data.forEach((job) => {
    job.site_locations.forEach((site) => {
      if (!siteLocationMap[site.id]) {
        siteLocationMap[site.id] = {
          id: site.id,
          name: site.name,
          site_location: site,
          jobs: []
        };
      }
      siteLocationMap[site.id].jobs.push({
        id: job.id,
        name: job.name,
        users: job.users
      });
    });
  });

  return Object.values(siteLocationMap);
};

// MarkerCustom component
const MarkerCustom = ({ siteLocation, jobs, currentZoom, setSelectedPerson, selectedPerson }: any) => {
  const formLayoutItem = useMemo<FormLayoutItem>(() => ({ labelCol: { span: 12 }, wrapperCol: { span: 12 } }), []);
  const calculateCirclePositions = (center: { lat: number; lng: number }, radius: number, count: number) => {
    const positions = [];
    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const lat = center.lat + (radius / 111.32) * Math.cos(angle);
      const lng = center.lng + (radius / (111.32 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(angle);
      positions.push({ lat, lng });
    }

    return positions;
  };

  const center = { lat: siteLocation.latitude, lng: siteLocation.longitude };
  const [currentIndexJob, setCurrentIndexJob] = useState(0);

  // Flatten all users from jobs
  const users = jobs?.[currentIndexJob].users || [];
  const avatarPositions = calculateCirclePositions(center, 0.05, users.length);
  const [showInfoWindow, setShowInfoWindow] = useState(false); // State để hiển thị popup
  useEffect(() => {
    if (currentZoom < 15) {
      setShowInfoWindow(false); // Đóng popup nếu zoom nhỏ hơn 15
    }
  }, [currentZoom]);
  return (
    <>
      {/* Marker for site location */}
      <Marker
        position={center}
        clickable={true}
        onClick={() => setShowInfoWindow(true)} // Hiển thị popup khi nhấp vào marker
      />
      {showInfoWindow && (
        <InfoWindow
          position={center}
          onCloseClick={() => setShowInfoWindow(false)} // Đóng popup khi nhấp vào nút đóng
        >
          <div className="relative flex flex-col items-center gap-y-4 ">
            <h4>{jobs[currentIndexJob]?.name || 'No Job Name'}</h4>

            <div className="flex gap-x-2">
              {jobs.length > 1 && (
                <Button
                  onClick={() => {
                    setCurrentIndexJob((prevIndex) => (prevIndex + 1) % jobs.length);
                  }}
                >
                  Next Job
                </Button>
              )}
              <Button onClick={() => setShowInfoWindow(false)}>Close</Button>
            </div>
          </div>
        </InfoWindow>
      )}
      {/* Display users around the marker if zoom level is sufficient */}
      {currentZoom >= 15 &&
        users.map((user: any, index: number) => (
          <OverlayView key={user.id} position={avatarPositions[index]} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
            <div
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: `2px solid ${user.status === 'active' ? 'green' : 'red'}`
              }}
              onClick={() => setSelectedPerson({ ...user, siteLocation })}
            >
              <img
                src={
                  user.avatar
                    ? DataHelper.getUrlFile(user.avatar || '')
                    : 'https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png'
                }
                alt={user.full_name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%'
                }}
              />
            </div>
          </OverlayView>
        ))}
      {selectedPerson && (
        <OverlayView
          position={{ lat: selectedPerson.siteLocation.latitude, lng: selectedPerson.siteLocation.longitude }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div
            style={{
              width: '500px',
              position: 'absolute',
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
          >
            <button
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20
              }}
              onClick={() => setSelectedPerson(null)}
            >
              x
            </button>
            <div className="flex items-center justify-between gap-4">
              <Image
                className="rounded-lg"
                width={100}
                height={100}
                src={
                  DataHelper.getUrlFile(selectedPerson?.avatar) ||
                  'https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png'
                }
              />

              <Form className="w-3/4" size="middle" {...formLayoutItem} labelAlign="left">
                <AppFormItem label="Name">
                  <p>{selectedPerson.full_name}</p>
                </AppFormItem>
                <AppFormItem label="Email">
                  <p>{selectedPerson.email}</p>
                </AppFormItem>
                <AppFormItem label="Phone number">
                  <p>{selectedPerson.phone}</p>
                </AppFormItem>
                <AppFormItem label="Status">
                  <Radio.Group value={selectedPerson?.status} className="flex">
                    <Radio.Button value="active">Active</Radio.Button>
                    <Radio.Button value="inactive">Inactive</Radio.Button>
                  </Radio.Group>
                </AppFormItem>
              </Form>
            </div>
          </div>
        </OverlayView>
      )}
    </>
  );
};

// Dashboard component
const Dashboard = () => {
  const containerStyle: React.CSSProperties = { height: '70vh', borderRadius: 4 };
  const zoom = 15;
  const libraries: Libraries = ['places'];
  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [data, setData] = useState<{
    customer_count: number;
    project_count: number;
    task_count: number;
    user_count: number;
    job_list: Job[];
  }>({
    customer_count: 0,
    project_count: 0,
    task_count: 0,
    user_count: 0,
    job_list: []
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY!,
    libraries,
    language: 'en'
  });

  const [center, setCenter] = useState({ lat: 10.762622, lng: 106.660172 });

  const fetchData = async () => {
    try {
      const res = await DashboardService.getAll();
      setData(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mappedData = useMemo(() => mapDataBySiteLocation(data.job_list), [data.job_list]);

  return (
    <>
      {' '}
      <Helmet>
        <title>{`${APP_NAME} - ${PathLabelEnum.dashboard}`}</title>
      </Helmet>
      <div className="dashboard flex flex-col gap-y-4">
        <CardList data={data} />{' '}
        <Select
          placeholder="Select Job"
          className="w-32"
          options={
            (data?.job_list || []).map((item: any, index: number) => ({
              value: index,
              label: item.name,
              ...item
            })) || []
          }
          onChange={(value) => {
            const selectedJob = data.job_list[value];
            if (selectedJob?.site_locations?.[0]) {
              setCenter({
                lat: selectedJob.site_locations[0].latitude,
                lng: selectedJob.site_locations[0].longitude
              });
            }
          }}
        />
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onZoomChanged={() => {
              const zoomLevel = mapRef.current?.getZoom();
              if (zoomLevel) setCurrentZoom(zoomLevel);
            }}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            onClick={(e) => {
              e.stop(); // Ngăn sự kiện mặc định
            }}
          >
            {mappedData.map((item) => (
              <MarkerCustom
                key={item.site_location.id}
                siteLocation={item.site_location}
                jobs={item.jobs}
                currentZoom={currentZoom}
                setSelectedPerson={setSelectedPerson}
                selectedPerson={selectedPerson}
              />
            ))}
          </GoogleMap>
        )}
        <p className="text-2xl font-bold">Top working hour</p>
        <Table
          columns={[
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'name'
            },
            {
              title: 'Email',
              dataIndex: 'email',
              key: 'email'
            },
            {
              title: 'Phone Number',
              dataIndex: 'phone',
              key: 'phone'
            },
            { title: 'Company', dataIndex: 'company', key: 'company' },
            { title: 'Team', dataIndex: 'team', key: 'team' },
            {
              title: 'Working hour',
              dataIndex: 'workingHour',
              key: 'workingHour'
            }
          ]}
          dataSource={people}
        />
      </div>
    </>
  );
};

export default Dashboard;
