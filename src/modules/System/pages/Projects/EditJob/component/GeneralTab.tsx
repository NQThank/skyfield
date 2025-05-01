import { GoogleMap, Libraries, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Col, Row, Spin, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { CSSProperties, useCallback, useState } from 'react';

import { JobDetail1, Map } from '@/core/types';

type Props = {
  jobDetail: JobDetail1;
  loading: boolean;
};

const GeneralTab = ({ jobDetail, loading }: Props) => {
  const [_map, setMap] = useState<Map | null>(null);
  const [zoom] = useState(15);
  const [place] = useState(jobDetail?.site_location || []);
  const [libraries] = useState<Libraries>(['places']);
  const [containerStyle] = useState<CSSProperties>({ height: '100%', minHeight: '300px', borderRadius: 4 });
  const [center] = useState({
    lat: jobDetail.site_location?.[0]?.latitude ?? 0,
    lng: jobDetail.site_location?.[0].longitude ?? 0
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY!,
    libraries,
    language: 'en'
  });
  const onLoad = useCallback(function callback(map: Map) {
    setMap(map);
  }, []);
  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);
  return (
    <Row gutter={[12, 12]}>
      <Col xl={24}>
        <div>
          <Typography.Title level={4}>Description</Typography.Title>
          <TextArea
            className="pointer-events-none"
            value={jobDetail?.description}
            placeholder="Controlled autosize"
            readOnly
            autoSize={{ minRows: 5, maxRows: 5 }}
          />
        </div>
      </Col>
      <Col xl={24} className="mt-4 min-h-[400px]">
        {isLoaded && center && (
          <Spin spinning={loading} wrapperClassName="h-full [&>.ant-spin-container]:h-full">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={zoom}
              onLoad={onLoad}
              onUnmount={onUnmount}
            >
              {place.length &&
                place.map((item, index) => (
                  <Marker key={index} position={{ lat: item.latitude ?? 0, lng: item.longitude ?? 0 }} />
                ))}
            </GoogleMap>
          </Spin>
        )}
      </Col>
    </Row>
  );
};

export default GeneralTab;
