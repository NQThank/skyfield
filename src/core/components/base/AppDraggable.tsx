import { Upload, UploadProps } from 'antd';
import React from 'react';

type AppDraggableProps = UploadProps & {
  children?: React.ReactNode;
} & {
  ref?: React.Ref<any>;
};

const AppDraggable: React.FC<AppDraggableProps> = React.forwardRef(({ children, ...props }, ref) => {
  const customRequest = (options: any) => {
    console.log('customRequest');
    const { onProgress, onSuccess } = options;
    if (onProgress && onSuccess) {
      onProgress({ percent: 50 });
      setTimeout(() => {
        onProgress({ percent: 100 });
        onSuccess('Ok');
      }, 1000);
    }
  };
  return (
    <Upload.Dragger customRequest={customRequest} {...props} ref={ref}>
      {children ?? (
        <div className="flex flex-col items-center gap-y-8 p-2">
          <i className="fa-solid fa-cloud-arrow-up fa-2xl text-primary" />
          <span>Click and drag file to this area to upload</span>
        </div>
      )}
    </Upload.Dragger>
  );
});

AppDraggable.displayName = 'AppDraggable';

export default AppDraggable;
