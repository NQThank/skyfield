import { GoogleMap, Libraries, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Col, Row, Spin } from 'antd';
import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import PathURL from '@/core/class/PathURL';
import { AppButton, Box } from '@/core/components';
import { useRole } from '@/core/hooks';
import { JobDetailInfo, Map, Place } from '@/core/types';

interface CardJobInfoProps {
  jobDetail?: JobDetailInfo;
  loading?: boolean;
}

type JobInfoDetailMap = {
  [key in keyof JobDetailInfo]?: string;
};

const CardJobInfo: React.FC<CardJobInfoProps> = ({ jobDetail, loading = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['button']);

  const { isEmployee } = useRole();

  const [map, setMap] = useState<Map | null>(null);
  const [zoom, setZoom] = useState(10);
  const [place, setPlace] = useState<Place | null>(null);
  const [libraries] = useState<Libraries>(['places']);
  const [containerStyle] = useState<CSSProperties>({ height: '100%', minHeight: '300px', borderRadius: 4 });
  const [center] = useState({
    lat: -3.745,
    lng: -38.523
  });
  const [jobInfoMap] = useState<JobInfoDetailMap>({
    name: 'Job Name',
    start_end_date: 'Forecast Start - End',
    scope_of_work: 'Scope of Work',
    customer: 'Customer',
    site_location: 'Site Location',
    tower_type: 'Tower Type',
    tower_owner: 'Tower Owner',
    tower_owner_poc: 'Tower Owner POC',
    contact: 'Contact',
    phone_number: 'Phone Number',
    description: 'Description'
  });
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY!,
    libraries,
    language: 'en'
  });

  const keys = useMemo(() => Object.keys(jobInfoMap), [jobInfoMap]);

  const onLoad = useCallback(
    function callback(map: Map) {
      // This is just an example of getting and using the map instance!!! don't just blindly copy!
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);
      setMap(map);
    },
    [center]
  );

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && jobDetail?.lat && jobDetail?.lng) {
      const place: Place = { lat: jobDetail?.lat, lng: jobDetail.lng };
      setPlace(place);
      map.panTo(place);
      setZoom(18);
    }
  }, [map, jobDetail]);

  const onEdit = () => {
    navigate(`/${PathURL.jobs}/edit/${id}`);
  };
  return (
    <Box className="p-4">
      <Row gutter={[12, 6]}>
        <Col xl={10} md={24}>
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <h3 className="flex-1 text-xl font-semibold">Job Information</h3>
              {!isEmployee && (
                <AppButton type="primary" ghost onClick={onEdit}>
                  {t('edit')}
                </AppButton>
              )}
            </div>
            <table className="w-full">
              <tbody>
                {keys.map((key) => (
                  <tr key={key}>
                    <td width={'50%'} className="p-1 align-top text-base font-semibold text-black">
                      {jobInfoMap[key as keyof JobDetailInfo]}
                    </td>
                    <td width={'50%'} className="p-1 text-left">
                      {jobDetail?.[key as keyof JobDetailInfo] ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Col>
        <Col xl={14} md={24}>
          {isLoaded && (
            <Spin spinning={loading} wrapperClassName="h-full [&>.ant-spin-container]:h-full">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {place && <Marker position={place} />}
              </GoogleMap>
            </Spin>
          )}
        </Col>
      </Row>
    </Box>
  );
};

export default CardJobInfo;
