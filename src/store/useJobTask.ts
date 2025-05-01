import { cloneDeep, isEmpty } from 'lodash';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { CommonService, JobTaskService } from '@/core/services';
import {
  FormItem,
  JobImage,
  JobSubTaskEquipment,
  JobSubTaskTemplate,
  LoadingJobTaskType,
  OpenJobTaskType,
  Position,
  Sector,
  TJobTemplateItemSubTask,
  TaskGeneralInfoType
} from '@/core/types';

type TaskStoreType = {
  sectors: Sector[];
  positions: Position[];
  jobSubTasks: JobSubTaskTemplate[];
  loading: boolean;
  jobTaskInfo?: TaskGeneralInfoType;
  jobTemplateItemsSubTaskMap: { [key: string]: TJobTemplateItemSubTask[] };
  jobSubTaskEquipmentsMap: { [key: string]: JobSubTaskEquipment[] };
  formItems: FormItem[];
  preview: boolean;
  isOpenJobTask: {
    [key in OpenJobTaskType]: boolean;
  };
  loadingJobTask: {
    [key in LoadingJobTaskType]: boolean;
  };
  imagesJobSubTaskItemMap: { [key: string]: JobImage[] };
  activeKeysSubTaskCollapse: string | string[];
  activeKeysChildSubTaskCollapse: string | string[];
  galleryImages: JobImage[];
  galleryImagesActive: JobImage[];
  templateItemActive?: TJobTemplateItemSubTask;
  subTaskIdActive?: string;
  imageSubTaskItemActive?: JobImage;
};

type TaskStoreAction = {
  loadItems: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setJobTaskInfo: (info: TaskGeneralInfoType) => void;
  setTemplateItemSubTask: (data: { [key: string]: TJobTemplateItemSubTask[] }) => void;
  setJobSubTaskEquipment: (data: { [key: string]: JobSubTaskEquipment[] }) => void;
  setJobSubTasks: (data: JobSubTaskTemplate[]) => void;
  updateJobSubTaskName: (
    id: string,
    update: Partial<JobSubTaskTemplate>,
    parentId?: string,
    drag_status?: boolean
  ) => void;
  setSectorsPositions: (sectors: Sector[], positions: Position[]) => void;
  addSectorPosition: (data: JobSubTaskTemplate) => void;
  updateSectorPosition: (
    id: string,
    data: { id: string; position_id: string; sector_id: string; name: string }
  ) => void;
  updateEquipmentToSubTask: (id: string, data: JobSubTaskEquipment[]) => void;
  deleteTemplateItemSubTaskItem: (subTaskId: string, templateItemId: string) => void;
  addSubTask: (data: JobSubTaskTemplate, parentId?: string) => void;
  deleteSubTask: (id: string, parentId?: string) => void;
  setFormItems: (items: FormItem[]) => void;
  addTemplateItem: (item: TJobTemplateItemSubTask, subTaskId: string) => void;
  updateTemplateItem: (item: TJobTemplateItemSubTask, subTaskId: string) => void;
  updateTemplateItemsSubTask: (item: TJobTemplateItemSubTask[], subTaskId: string, forceClear?: boolean) => void;
  setPreview: (preview: boolean) => void;
  setIsOpenJobTask: (type: OpenJobTaskType, data: boolean) => void;
  updateImagesJobSubTaskItem: (
    subTaskItemId: string,
    data: JobImage[],
    type?: 'add' | 'delete' | 'reset' | 'update'
  ) => void;
  setActiveKeysSubTaskCollapse: (data: string | string[]) => void;
  setActiveKeysChildSubTaskCollapse: (data: string | string[]) => void;
  setGalleryImages: (data: JobImage[]) => void;
  setGalleryImagesActive: (data: JobImage[]) => void;
  deleteGalleryImage: (data: JobImage) => void;
  setTemplateItemActive: (data?: TJobTemplateItemSubTask) => void;
  setSubTaskIdActive: (subTaskId?: string) => void;
  setImageSubTaskItemActive: (imageSubTaskItemActive?: JobImage) => void;
  fetchJobImages: (jobId: string) => Promise<void>;
  isUpdateTask: boolean;
  setIsUpdateTask: (isUpdateTask: boolean) => void;
};

const useJobTask = create<TaskStoreType & TaskStoreAction>()(
  devtools(
    immer((set, get) => ({
      sectors: [],
      positions: [],
      jobSubTasks: [],
      loading: false,
      jobTemplateItemsSubTaskMap: {},
      jobSubTaskEquipmentsMap: {},
      formItems: [],
      preview: false,
      imagesJobSubTaskItemMap: {},
      isOpenJobTask: {
        'subtask-image': false,
        equipment: false,
        'template-item': false,
        'add-item': false,
        'add-item-image': false
      },
      loadingJobTask: {
        'form-items': false,
        'job-image': false
      },
      activeKeysSubTaskCollapse: [],
      activeKeysChildSubTaskCollapse: [],
      galleryImages: [],
      subTasks: [],
      isUpdateTask: false,
      galleryImagesActive: [],
      setIsUpdateTask(isUpdateTask) {
        set({ isUpdateTask });
      },
      async loadItems() {
        set({
          loadingJobTask: {
            ...get().loadingJobTask,
            'form-items': true
          }
        });
        try {
          const res = await CommonService.getFormItemTypes();
          if (res.success) {
            set({ formItems: res.data });
          }
        } finally {
          set({
            loadingJobTask: {
              ...get().loadingJobTask,
              'form-items': false
            }
          });
        }
      },
      setLoading(loading) {
        set({ loading: loading });
      },
      setJobTaskInfo(info) {
        set({ jobTaskInfo: info });
      },
      setTemplateItemSubTask(data) {
        set({ jobTemplateItemsSubTaskMap: { ...get().jobTemplateItemsSubTaskMap, ...data } });
      },
      setJobSubTaskEquipment(data) {
        set({ jobSubTaskEquipmentsMap: data });
      },
      setJobSubTasks(data) {
        set((state) => {
          const parentMapIndex: { [key: string]: number } = {};
          const jobSubTasks = data.reduce<JobSubTaskTemplate[]>((res, current) => {
            // is sub task
            if (!current.parent_id) {
              res.push({ ...current });
            } else {
              // is sector position
              if (!parentMapIndex[current.parent_id]) {
                parentMapIndex[current.parent_id] = res.length;
                res.push({
                  id: current.parent_id,
                  name: current.parent_id,
                  order_value: current.parent_order ?? 0,
                  sector_id: current.sector_id,
                  position_id: current.position_id,
                  children: [
                    {
                      ...current
                    }
                  ],
                  status: 'init',
                  drag_status: current.drag_status
                });
              } else {
                const _itemCurrent = res[parentMapIndex[current['parent_id']]];
                res[parentMapIndex[current['parent_id']]] = {
                  ..._itemCurrent,
                  children: [
                    ...(_itemCurrent?.children ?? []),
                    {
                      ...current
                    }
                  ]
                };
              }
            }
            return res;
          }, []);
          console.log('🚀 ~ jobSubTasks ~ jobSubTasks:', jobSubTasks);
          state.jobSubTasks = jobSubTasks;
          if (!isEmpty(jobSubTasks)) {
            state.activeKeysSubTaskCollapse = jobSubTasks[0].id;
            if (jobSubTasks[0].children) {
              state.activeKeysChildSubTaskCollapse = jobSubTasks[0].children[0].id;
            }
          }
        });
      },
      updateJobSubTaskName(id: string, updates: Partial<JobSubTaskTemplate>, parentId?: string) {
        set((state) => {
          const subTaskIndex = state.jobSubTasks.findIndex((item) =>
            !parentId ? item.id === id : item.id === parentId
          );
          if (subTaskIndex === -1) return;

          if (!parentId) {
            // Cập nhật trực tiếp subTask
            state.jobSubTasks[subTaskIndex] = {
              ...state.jobSubTasks[subTaskIndex],
              ...updates // Chỉ cập nhật các key có trong updates
            };
            return;
          }

          const children = state.jobSubTasks[subTaskIndex].children;
          if (!children?.length) return;

          const childrenIndex = children.findIndex((item) => item.id === id);
          if (childrenIndex === -1) return;

          // Cập nhật children
          state.jobSubTasks[subTaskIndex].children![childrenIndex] = {
            ...state.jobSubTasks[subTaskIndex].children![childrenIndex],
            ...updates // Chỉ cập nhật các key có trong updates
          };
        });
      },
      setSectorsPositions(sectors, positions) {
        set({ sectors: sectors, positions: positions });
      },
      addSectorPosition(data) {
        set((state) => {
          state.jobSubTasks.push(data);
        });
      },
      updateSectorPosition(id, data) {
        set((state) => {
          const index = get().jobSubTasks.findIndex((item) => item.id === id);
          if (index === -1) return;
          state.jobSubTasks[index] = { ...state.jobSubTasks[index], ...data };
        });
      },
      updateEquipmentToSubTask(id, data) {
        set((state) => {
          state.jobSubTaskEquipmentsMap[id] = data;
        });
      },
      deleteTemplateItemSubTaskItem(subTaskId, templateItemId) {
        const templateItemsSubTask = get().jobTemplateItemsSubTaskMap[subTaskId];
        if (!templateItemsSubTask) return;
        const templateItemsFilter = templateItemsSubTask.filter((item) => item.id !== templateItemId);
        set((state) => {
          state.jobTemplateItemsSubTaskMap[subTaskId] = templateItemsFilter;
        });
      },
      addSubTask(data, parentId) {
        set((state) => {
          if (parentId) {
            const parentIndex = get().jobSubTasks.findIndex((item) => item.id === parentId);
            if (parentIndex === -1) return;
            state.jobSubTasks[parentIndex].children?.push(data);
          } else {
            state.jobSubTasks.push(data);
          }
        });
      },
      deleteSubTask(id, parentId) {
        set((state) => {
          if (!parentId) {
            state.jobSubTasks = get().jobSubTasks.filter((item) => item.id !== id);
          } else {
            const parentIndex = get().jobSubTasks.findIndex((item) => item.id === parentId);
            if (parentIndex === -1) return;
            state.jobSubTasks[parentIndex].children = get().jobSubTasks[parentIndex].children?.filter(
              (item) => item.id !== id
            );
          }
        });
      },
      setFormItems(items) {
        set({ formItems: items });
      },
      addTemplateItem(item, subTaskId) {
        set((state) => {
          state.jobTemplateItemsSubTaskMap[subTaskId] = [...get().jobTemplateItemsSubTaskMap[subTaskId], item];
        });
      },
      updateTemplateItem(item, subTaskId) {
        set((state) => {
          const items = get().jobTemplateItemsSubTaskMap[subTaskId];
          const _items = cloneDeep(items);
          const itemIndex = _items.findIndex((el) => el.id === item.id);
          if (itemIndex === -1) return;
          _items[itemIndex] = item;
          state.jobTemplateItemsSubTaskMap[subTaskId] = [..._items];
        });
      },
      updateTemplateItemsSubTask(items, subTaskId, forceClear = true) {
        set((state) => {
          if (forceClear) {
            state.jobTemplateItemsSubTaskMap[subTaskId] = items;
            return;
          }
          state.jobTemplateItemsSubTaskMap[subTaskId] = [
            ...(get().jobTemplateItemsSubTaskMap[subTaskId] ?? []),
            ...items
          ];
        });
      },
      setPreview(preview) {
        set({ preview });
      },
      setIsOpenJobTask(type, data) {
        set({
          isOpenJobTask: {
            ...get().isOpenJobTask,
            [type]: data
          }
        });
      },
      updateImagesJobSubTaskItem(subTaskItemId, data, type) {
        switch (type) {
          case 'add': {
            const _items = cloneDeep(get().imagesJobSubTaskItemMap?.[subTaskItemId] ?? []);
            _items.push(...data);
            set({ imagesJobSubTaskItemMap: { ...get().imagesJobSubTaskItemMap, [subTaskItemId]: _items } });
            break;
          }
          case 'reset': {
            set({ imagesJobSubTaskItemMap: { ...get().imagesJobSubTaskItemMap, [subTaskItemId]: data } });
            break;
          }
          case 'delete': {
            const _items = cloneDeep(get().imagesJobSubTaskItemMap?.[subTaskItemId] ?? []);
            const itemsAfterDelete = _items.filter((el) => !data.map((item) => item.id).includes(el.id));
            set({ imagesJobSubTaskItemMap: { ...get().imagesJobSubTaskItemMap, [subTaskItemId]: itemsAfterDelete } });
            break;
          }
          case 'update': {
            if (!data.length) return;
            const _items = cloneDeep(get().imagesJobSubTaskItemMap?.[subTaskItemId] ?? []);
            const indexItemUpdate = _items.findIndex((item) => item.id === data[0].id);
            if (indexItemUpdate === -1) return;
            _items[indexItemUpdate] = data[0];
            set({ imagesJobSubTaskItemMap: { ...get().imagesJobSubTaskItemMap, [subTaskItemId]: _items } });
            break;
          }
        }
      },
      setActiveKeysSubTaskCollapse(data) {
        set({ activeKeysSubTaskCollapse: data });
      },
      setActiveKeysChildSubTaskCollapse(data) {
        set({ activeKeysChildSubTaskCollapse: data });
      },
      setGalleryImages(data) {
        set({ galleryImages: data });
      },
      setGalleryImagesActive(data) {
        set({ galleryImagesActive: data });
      },
      deleteGalleryImage(data) {
        const _images = get().galleryImages.filter((item) => item.id !== data.id);
        set({ galleryImages: _images });
      },
      setTemplateItemActive(data) {
        set({ templateItemActive: data });
      },
      setSubTaskIdActive(subTaskIdActive) {
        set({ subTaskIdActive });
      },
      setImageSubTaskItemActive(imageSubTaskItemActive) {
        set({ imageSubTaskItemActive });
      },
      async fetchJobImages(jobId: string) {
        set({ loadingJobTask: { ...get().loadingJobTask, 'job-image': true } });
        try {
          const res = await JobTaskService.getGalleries(jobId, { page_number: 1, page_size: 10 });
          if (res.success) {
            set({ galleryImages: res.data ?? [] });
          }
        } finally {
          set({ loadingJobTask: { ...get().loadingJobTask, 'job-image': false } });
        }
      }
    }))
  )
);

export default useJobTask;
