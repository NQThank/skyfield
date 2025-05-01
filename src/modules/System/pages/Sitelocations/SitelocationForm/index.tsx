import { Autocomplete, GoogleMap, Libraries, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Col, Form, Input, InputNumber, Row, Spin } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppButton, AppPageHeader, Box } from '@/core/components';
import { useAppDispatch, useForm } from '@/core/hooks';
import { SitelocationService } from '@/core/services';
import { AutocompleteType, Map, Place, ResponseCommon } from '@/core/types';
import { setNameMap } from '../../common.slice';

import PathURL from '@/core/class/PathURL';
import styles from '@/styles/pages/_sitelocationform.module.scss';
import TextArea from 'antd/es/input/TextArea';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

const schema = yup.object({
  name: yup.string().required(),
  address: yup.string().nullable(),
  country: yup.string().nullable(),
  latitude: yup.number().nullable(),
  longitude: yup.number().nullable(),
  structural_owner: yup.string().nullable(),
  structural_code: yup.string().nullable(),
  structural_name: yup.string().nullable(),
  structural_type: yup.string().nullable(),
  structural_height: yup.number().nullable(),
  mount_cl: yup.number().nullable(),
  antennas_cl: yup.number().nullable(),
  access_info: yup.string().nullable()
});

type SiteLocationForm = yup.InferType<typeof schema>;

const SitelocationFormPage = () => {
  const { t } = useTranslation(['message']);
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLInputElement>(null);
  const [libraries] = useState<Libraries>(['places']);
  const [autocomplete, setAutocomplete] = useState<AutocompleteType | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [zoom, setZoom] = useState(4);
  const [place, setPlace] = useState<Place | null>(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY!,
    libraries,
    language: 'en'
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formChange, setFormChange] = useState(false);

  const {
    formField: { form, ...props }
  } = useForm<SiteLocationForm>({
    schema,
    onSubmit: async (values) => {
      if (!values) return;
      try {
        setSubmitting(true);
        const payload = { ...values };
        if (inputRef.current) {
          payload.address = inputRef.current.value;
        }
        let res: ResponseCommon<null> | null = null;
        if (id) {
          res = await SitelocationService.updateSitelocation(id, payload);
        } else {
          res = await SitelocationService.addSitelocation(payload);
        }
        if (res.success) {
          onCancel();
          toast.success(t(['success']));
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  const lat = Form.useWatch('latitude', form);
  const lng = Form.useWatch('longitude', form);

  useEffect(() => {
    if (lat && lng && formChange) {
      setPlace({ lat, lng });
      if (map) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }).then((res) => {
          if (res.results[0] && inputRef.current) {
            inputRef.current.value = res.results[0].formatted_address;
          }
        });
      }
    }
  }, [lat, lng, map, formChange]);

  useEffect(() => {
    const fetchSitelocationById = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { success, data } = await SitelocationService.getSitelocationById(id!);
        if (success && data) {
          form.setFieldsValue({ ...data });
          if (data?.latitude && data?.longitude) {
            setPlace({ lat: data.latitude, lng: data.longitude });
          }
          if (inputRef?.current) {
            inputRef.current.value = data?.address ?? '';
          }
          dispatch(setNameMap({ [id]: data.name }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSitelocationById();
  }, [id, form, dispatch]);

  useEffect(() => {
    if (map && place) {
      map.panTo(place);
      setZoom(18);
    }
  }, [place, map]);

  const onBack = () => {
    navigate(-1);
  };

  const onLoad = useCallback(function callback(map: Map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const onLoadAutoComplete = (autocomplete: AutocompleteType) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      if (lat !== undefined && lng !== undefined) {
        setPlace({ lat, lng });
        form.setFieldsValue({ latitude: lat, longitude: lng });
      }
    }
  };

  const onClear = () => {
    inputRef.current && (inputRef.current.value = '');
  };

  const onCancel = () => {
    navigate(`/${PathURL.sitelocations}`);
  };

  const onOk = () => {
    form.submit();
  };

  const onValuesChange = () => {
    setFormChange(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-y-4">
        <AppPageHeader onBack={onBack}>Site Location</AppPageHeader>
        <Spin spinning={loading}>
          <Box>
            <Form layout="vertical" form={form} {...props} onValuesChange={onValuesChange}>
              <Row gutter={[24, 6]}>
                <Col span={8}>
                  <Form.Item label="Name" name={'name'} required>
                    <Input placeholder="Sitelocation Name" />
                  </Form.Item>
                  <Form.Item label="Structural Owner" name={'structural_owner'}>
                    <Input placeholder="Structural Owner" />
                  </Form.Item>
                  <Form.Item label="Structural Code" name={'structural_code'}>
                    <Input placeholder="Structural Code" />
                  </Form.Item>
                  <Form.Item label="Structural Name" name={'structural_name'}>
                    <Input placeholder="Structural Name" />
                  </Form.Item>
                  <Form.Item label="Structural Type" name={'structural_type'}>
                    <Input placeholder="Structural Type" />
                  </Form.Item>
                  <Form.Item label="Structural Height" name={'structural_height'}>
                    <InputNumber placeholder="Structural Height" className="w-full" />
                  </Form.Item>
                  <Form.Item label="Mount CL" name={'mount_cl'}>
                    <InputNumber placeholder="Mount CL" className="w-full" />
                  </Form.Item>
                  <Form.Item label="Antennas CL" name={'antennas_cl'}>
                    <InputNumber placeholder="Antennas CL" className="w-full" />
                  </Form.Item>
                  <Form.Item label="Access Info" name={'access_info'}>
                    <TextArea rows={3} placeholder="Access Info" />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <div>
                    {isLoaded ? (
                      <>
                        <GoogleMap
                          mapContainerStyle={containerStyle}
                          center={center}
                          zoom={zoom}
                          onLoad={onLoad}
                          onUnmount={onUnmount}
                        >
                          {place && <Marker position={place} />}
                        </GoogleMap>
                        <Form.Item label="Address">
                          <Autocomplete onLoad={onLoadAutoComplete} onPlaceChanged={onPlaceChanged}>
                            <div className={styles['input-wrapper']}>
                              <input
                                type="text"
                                placeholder="Find address"
                                className={styles['input-search']}
                                ref={inputRef}
                              />
                              {inputRef?.current?.value && (
                                <i className={`${styles['icon-clear']} fa-solid fa-circle-xmark`} onClick={onClear} />
                              )}
                            </div>
                          </Autocomplete>
                        </Form.Item>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>

                  <Form.Item label="Latitude" name="latitude">
                    <InputNumber placeholder="Latitude" className="!w-full" />
                  </Form.Item>
                  <Form.Item label="Longitude" name="longitude">
                    <InputNumber placeholder="Longitude" className="!w-full" />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <div className="flex w-full justify-end gap-x-4">
                  <AppButton type="text" onClick={onCancel}>
                    Cancel
                  </AppButton>
                  <AppButton type="primary" onClick={onOk} loading={submitting}>
                    {`${id ? 'Update' : 'Create'}`}
                  </AppButton>
                </div>
              </Row>
            </Form>
          </Box>
        </Spin>
      </div>
    </div>
  );
};

export default SitelocationFormPage;
