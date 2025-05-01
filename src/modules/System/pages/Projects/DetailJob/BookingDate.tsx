import { Col, Popover, Radio, RadioChangeEvent, Row } from 'antd';
import type { SizeType } from 'antd/lib/config-provider/SizeContext';
import dayjs from 'dayjs';
import React, { forwardRef, memo, useCallback, useMemo } from 'react';
import {
  Calendar,
  EventPropGetter,
  HeaderProps,
  NavigateAction,
  ToolbarProps,
  dayjsLocalizer
} from 'react-big-calendar';

import { DateFormat, JobStatusEnum } from '@/core/enums';
import { useScreen } from '@/core/hooks';
import { ActionToolBar, BookingEvent, CalendarRef } from '@/core/types';
import { DataHelper, FormatHelper } from '@/utils/helpers';
// import './index.scss';
// import StatusTagBooking from '@/core/components/shared/StatusTagBooking';

const localizer = dayjsLocalizer(dayjs);

type BookingDateProps = {
  data: any[];
  handleOpenDetailJob: (id: string) => void;
};

const BookingDate = forwardRef<CalendarRef, BookingDateProps>(({ data = [], handleOpenDetailJob }, ref) => {
  const events = useMemo(() => FormatHelper.parseBookingToEvent(data), [data]);
  const eventPropGetter: EventPropGetter<BookingEvent> = useCallback(
    (event: { status: string }) => ({
      className: event.status === 'cancelled' ? '!border-gray-600 !bg-gray-300 !text-gray-600' : ''
    }),
    []
  );

  const handleEnablePopover = (event: any) => {
    return (
      <div className="w-96">
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span>
              <b>Job Name:</b> {event.title}
            </span>
          </Col>
          <Col span={24}>
            <span>
              <b>Customer Name:</b> {event.customer_name}
            </span>
          </Col>
          <Col span={24}>
            <span>
              <b>Team Name:</b> {event.team_name}
            </span>
          </Col>
          <Col span={24}>
            <span>
              <b>Status:</b> {DataHelper.getEnumKeyByValue(event.status, JobStatusEnum)}
            </span>
          </Col>
          <Col span={24}>
            <span>
              <b>Time:</b> {dayjs(event.start).format(DateFormat['MM/DD/YYYY'])}
            </span>
          </Col>
        </Row>
      </div>
    );
  };
  return (
    <div className="h-[600px]">
      <Calendar<BookingEvent>
        ref={ref}
        selectable
        formats={{
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
            return `${dayjs(start).format(DateFormat['MMMM DD'])} - ${dayjs(end).format(DateFormat['MMMM DD'])}`;
          },
          dayHeaderFormat: DateFormat['dddd, MMMM DD'],
          dayFormat: DateFormat['DD dddd']
        }}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        components={{
          toolbar: ToolbarCustom,
          month: {
            header: headerMonthView
          },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          eventWrapper: ({ event, children }) => (
            <div
              onMouseOver={(e) => {
                e.preventDefault();
              }}
            >
              <Popover content={handleEnablePopover(event)} title={<h3 className="text-lg">Job Detail</h3>}>
                {children}
              </Popover>
            </div>
          )
        }}
        eventPropGetter={eventPropGetter}
        onSelectEvent={(event: any) => {
          console.log('Selected event:', event.id); // Thao tác khi click vào sự kiện
          handleOpenDetailJob(event.id); // Gọi hàm mở chi tiết công việc
        }}
      />
    </div>
  );
});

BookingDate.displayName = 'BookingDate';

const ToolbarCustom: React.FC<ToolbarProps> = ({ onNavigate, label, onView, view }) => {
  const { md } = useScreen();
  const onChangeNavigateAction = (action: NavigateAction) => {
    onNavigate(action);
  };

  const onChangeNavigateView = (e: RadioChangeEvent) => {
    onView(e.target.value);
  };

  const actions = useMemo<ActionToolBar[]>(
    () => [
      {
        action: 'PREV',
        label: 'Previous'
      },
      {
        action: 'TODAY',
        label: 'Today'
      },
      {
        action: 'NEXT',
        label: 'Next'
      }
    ],
    []
  );

  const size = useMemo<SizeType>(() => (md ? 'middle' : 'small'), [md]);
  return (
    <div className="mb-2 flex items-center justify-between">
      <Radio.Group defaultValue="TODAY" size={size} onChange={(e) => onChangeNavigateAction(e.target.value)}>
        {actions.map(({ action, label }) => (
          <Radio.Button value={action} key={action} onClick={() => onChangeNavigateAction(action)}>
            {label}
          </Radio.Button>
        ))}
      </Radio.Group>
      <span className="text-base font-semibold">{label}</span>
      <Radio.Group defaultValue="month" size={size} value={view} onChange={onChangeNavigateView}>
        <Radio.Button value="month">Month</Radio.Button>
        <Radio.Button value="week">Week</Radio.Button>
        <Radio.Button value="day">Day</Radio.Button>
      </Radio.Group>
    </div>
  );
};

const headerMonthView: React.FC<HeaderProps> = ({ localizer, date }) => {
  return <>{localizer.format(date, DateFormat.dddd)}</>;
};

export default memo(BookingDate);
