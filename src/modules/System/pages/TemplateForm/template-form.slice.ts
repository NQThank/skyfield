import { RootState } from '@/app/store';
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { groupBy, orderBy } from 'lodash';
import { UploadFile } from 'antd';

import { SliceEnum } from '@/core/enums';
import { CommonService } from '@/core/services';
import {
  CollapseKey,
  EquipmentSubTask,
  EquipmentSubTaskPayload,
  GeneralInfoForm,
  ITemplateItem,
  ItemTemplate,
  LoadingType,
  ModalType,
  SubTaskGroup,
  SubTaskTemplate,
  SubTaskTemplateRes,
  TemplateForm,
  TemplateSubTask
} from '@/core/types';
import { CommonHelper, DataHelper, FormatHelper } from '@/utils/helpers';

const name = SliceEnum['task-template-form'];

export const fetchFormItems = createAsyncThunk(`${name}/fetchFormItems`, async () => {
  const res = await CommonService.getFormItemTypes();
  return res.data;
});

export const fetchSectors = createAsyncThunk(`${name}/fetchSectors`, async () => {
  const res = await CommonService.getSectors();
  return res.data;
});
export const fetchPositions = createAsyncThunk(`${name}/fetchPositions`, async () => {
  const res = await CommonService.getPositions();
  return res.data;
});

const initialState: TemplateForm = {
  loading: {
    loadingFormItems: false,
    loadingData: false
  },
  isOpen: {
    'template-item-form-edit': false,
    'sector-position': false
  },
  formItems: [],
  sectors: [],
  positions: [],
  subTaskActive: null,
  template: {
    documentList: [],
    delete_document_ids: [],
    delete_sub_task_equipment_ids: [],
    delete_sub_task_ids: [],
    delete_template_item_ids: [],
    name: '',
    sector_required: true,
    itemTemplates: {},
    equipmentsSubTask: {},
    activeKeySectorPosition: [],
    activeKeySubTaskListParent: [],
    subTasksTemplate: [],
    subTasksGroup: []
  }
};

export const templateSlice = createSlice({
  name,
  initialState,
  reducers: {
    setActiveKeySubTaskList(state, action: PayloadAction<string | string[]>) {
      state.template.activeKeySectorPosition = action.payload;
    },
    setActiveKeySubTaskListParent(state, action: PayloadAction<string | string[]>) {
      state.template.activeKeySubTaskListParent = action.payload as CollapseKey[];
    },
    setSectorRequired(state, action: PayloadAction<boolean>) {
      state.template.sector_required = action.payload;
    },
    setTemplateName(state, action: PayloadAction<string>) {
      state.template.name = action.payload;
    },

    addTemplateItemSubTask(state, action: PayloadAction<{ data: ITemplateItem; subTaskId: string }>) {
      const { data, subTaskId } = action.payload;
      state.template.itemTemplates[subTaskId] = [...(state.template.itemTemplates[subTaskId] || []), data];
    },
    sortTemplateItemsSubTask(state, action: PayloadAction<{ subTaskId: string; data: ITemplateItem[] }>) {
      const { data, subTaskId } = action.payload;
      state.template.itemTemplates[subTaskId] = data;
    },
    setSubTaskActive(state, action: PayloadAction<TemplateSubTask>) {
      state.subTaskActive = action.payload;
    },
    setEquipmentsSubTask(state, action: PayloadAction<{ subTaskId: string; data: EquipmentSubTask[] }>) {
      state.template.equipmentsSubTask[action.payload.subTaskId] = action.payload.data;
    },
    toggleOpenModal(state, action: PayloadAction<ModalType>) {
      state.isOpen[action.payload] = !state.isOpen[action.payload];
    },
    deleteTemplateItem(
      state,
      action: PayloadAction<{ subTaskId: string; templateItemId: string; templateItemUid?: string }>
    ) {
      const { subTaskId, templateItemId, templateItemUid } = action.payload;
      state.template.itemTemplates[subTaskId] = state.template.itemTemplates[subTaskId].filter(
        (item) => item.id !== templateItemId
      );
      if (templateItemUid) {
        state.template.delete_template_item_ids.push(templateItemUid);
      }
    },
    addSubTaskGroup(state, action: PayloadAction<SubTaskGroup>) {
      state.template.subTasksGroup.push({ ...action.payload });
    },
    addSubTaskTemplate(state, action: PayloadAction<{ sector_id: string; position_id: string; parent_id: string }>) {
      const { parent_id, position_id, sector_id } = action.payload;
      state.template.subTasksTemplate.push({
        id: CommonHelper.generateStr(),
        parent_id,
        sector_id,
        position_id,
        order_value: 1,
        name: 'Sub Task 1'
      });
    },
    deleteSubTaskTemplate(state, action: PayloadAction<{ uid?: string; id: string; isGroup: boolean }>) {
      const { id, isGroup, uid } = action.payload;

      if (isGroup) {
        state.template.subTasksGroup = state.template.subTasksGroup.filter((item) => item.id !== id);
      } else {
        state.template.subTasksTemplate = state.template.subTasksTemplate.filter((item) => item.id !== id);
      }
      if (uid) {
        state.template.delete_sub_task_ids.push(uid);
      }
      const templateItems = state.template.itemTemplates[id];
      const equipments = state.template.equipmentsSubTask[id];
      if (templateItems) {
        state.template.delete_template_item_ids.push(
          ...templateItems.filter((item) => item.uid).map((item) => item.uid!)
        );
        delete state.template.itemTemplates?.[id];
      }
      if (equipments) {
        state.template.delete_sub_task_equipment_ids.push(
          ...equipments.filter((item) => item.uid).map((item) => item.uid!)
        );
        delete state.template.equipmentsSubTask?.[id];
      }
    },
    updateNameSubTaskTemplate(state, action: PayloadAction<{ id: string; name: string; isGroup: boolean }>) {
      const { name, isGroup, id } = action.payload;
      if (isGroup) {
        const subTaskGroup = state.template.subTasksGroup.find((item) => item.id === id);
        subTaskGroup && (subTaskGroup.name = name);
      } else {
        const subTaskTemplate = state.template.subTasksTemplate.find((item) => item.id === id);
        subTaskTemplate && (subTaskTemplate.name = name);
      }
    },
    setGeneralInfo(state, action: PayloadAction<GeneralInfoForm>) {
      state.template.generalInfo = action.payload;
    },

    setTaskTemplate(state, action: PayloadAction<{ data: SubTaskTemplateRes[]; from: 'job-task' | 'task-template' }>) {
      let subTasksGroup: SubTaskGroup[] = [];
      const subTasksTemplate: SubTaskTemplate[] = [];
      const _subTasksTemplate = action.payload.data;
      const itemTemplates: ItemTemplate = {};
      const equipmentsSubTask: EquipmentSubTaskPayload = {};
      const subTaskTemplateGroup = groupBy(_subTasksTemplate, (_subTaskTemplate) => _subTaskTemplate.parent_id);

      Object.keys(subTaskTemplateGroup).forEach((key) => {
        if (key === '') {
          subTaskTemplateGroup[key].forEach(
            ({
              name,
              order_value,
              position_id,
              sector_id,
              sub_task_template_equipments,
              task_item_templates,
              id,
              approve_required,
              item_required,
              marker
            }) => {
              const subTaskGroupId = CommonHelper.generateStr();
              subTasksGroup.push({
                id: subTaskGroupId,
                uid: id,
                isSubTask: true,
                name,
                order_value,
                position_id,
                sector_id,
                approve_required,
                item_required,
                marker
              });
              itemTemplates[subTaskGroupId] = orderBy(
                task_item_templates?.map((itemTemplate) => ({
                  id: CommonHelper.generateStr(),
                  uid: itemTemplate.id,
                  name: itemTemplate.name,
                  order_value: itemTemplate.order_value,
                  value: FormatHelper.tryParseJson(itemTemplate.value),
                  inspected_value: itemTemplate.inspected_value,
                  parent_id: subTaskGroupId,
                  documents:
                    itemTemplate?.documents?.map((document) => ({
                      uid: document.id,
                      name: document.name,
                      url: DataHelper.getUrlFile(document.download_url),
                      type: 'old'
                    })) ?? []
                })) ?? [],
                ['order_value']
              );
              equipmentsSubTask[subTaskGroupId] =
                sub_task_template_equipments?.map((item) => ({
                  id: CommonHelper.generateStr(),
                  uid: item.id,
                  equipment_id: item.equipment_id,
                  equipment_name: item.equipment_name,
                  quantity: item.quantity,
                  serial_number: item.serial_number,
                  equipment_type: item.equipment_type
                })) ?? [];
            }
          );
        } else {
          const subTaskOne = subTaskTemplateGroup[key][0];
          const { position_id, sector_id, parent_order } = subTaskOne;
          subTasksGroup.push({
            id: key,
            isSubTask: false,
            position_id,
            sector_id,
            order_value: parent_order,
            name: key
          });
          subTaskTemplateGroup[key].forEach(
            ({
              sub_task_template_equipments,
              task_item_templates,
              parent_id,
              name,
              order_value,
              position_id,
              sector_id,
              id
            }) => {
              const subTaskId = CommonHelper.generateStr();
              subTasksTemplate.push({ name, order_value, position_id, sector_id, id: subTaskId, parent_id, uid: id });
              itemTemplates[subTaskId] = orderBy(
                task_item_templates?.map((itemTemplate) => ({
                  id: CommonHelper.generateStr(),
                  uid: itemTemplate.id,
                  name: itemTemplate.name,
                  order_value: itemTemplate.order_value,
                  value: FormatHelper.tryParseJson(itemTemplate.value),
                  inspected_value: itemTemplate.inspected_value,
                  parent_id: subTaskId,
                  documents:
                    itemTemplate?.documents?.map((document) => ({
                      uid: document.id,
                      name: document.name,
                      url: DataHelper.getUrlFile(document.download_url),
                      type: 'old'
                    })) ?? []
                })) ?? [],
                ['order_value']
              );
              equipmentsSubTask[subTaskId] =
                sub_task_template_equipments?.map((item) => ({
                  id: CommonHelper.generateStr(),
                  uid: item.id,
                  equipment_id: item.equipment_id,
                  equipment_name: item.equipment_name,
                  quantity: item.quantity,
                  serial_number: item.serial_number,
                  equipment_type: item.equipment_type
                })) ?? [];
            }
          );
        }
      });
      subTasksGroup = orderBy(subTasksGroup, ['order_value'], ['asc']);
      state.template = { ...state.template, subTasksGroup, equipmentsSubTask, itemTemplates, subTasksTemplate };
    },
    reset() {
      return initialState;
    },
    setItemTemplateEdit(state, action: PayloadAction<ITemplateItem>) {
      state.template.itemTemplateEdit = action.payload;
    },
    updateItemTemplate(state, action: PayloadAction<ITemplateItem>) {
      const itemTemplate = action.payload;
      const parentTemplates = state.template.itemTemplates[itemTemplate.parent_id];
      if (parentTemplates) {
        const itemTemplateIndex = parentTemplates.findIndex((item) => item.uid === itemTemplate.uid);

        if (itemTemplateIndex !== -1) {
          parentTemplates[itemTemplateIndex] = itemTemplate;
        }
      }
    },
    clearItemTemplateEdit(state) {
      state.template.itemTemplateEdit = undefined;
    },
    toggleLoading(state, action: PayloadAction<LoadingType>) {
      state.loading[action.payload] = !state.loading[action.payload];
    },
    deleteEquipmentSubTask(state, action: PayloadAction<string | undefined>) {
      const uid = action.payload;
      uid && state.template.delete_sub_task_equipment_ids.push(uid);
    },
    deleteSubtaskGroup(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.template.subTasksGroup = state.template.subTasksGroup.filter((item) => item.id !== id);
      const subTasksByGroup = state.template.subTasksTemplate.filter((item) => item.parent_id === id);
      subTasksByGroup.forEach((item) => {
        templateSlice.caseReducers.deleteSubTaskTemplate(state, {
          payload: { isGroup: false, id: item.id, uid: item.uid },
          type: action.type
        });
      });
    },
    setSubTaskGroupEdit(state, action: PayloadAction<string | undefined>) {
      state.subTaskGroupIdActive = action.payload;
    },
    updateSubTaskGroup(state, action: PayloadAction<{ id: string; position_id?: string; sector_id: string }>) {
      if (!state.subTaskGroupIdActive) return;
      const { id, sector_id, position_id } = action.payload;
      const subTaskGroupIndex = state.template.subTasksGroup.findIndex(
        (item) => item.id === state.subTaskGroupIdActive
      );
      if (subTaskGroupIndex === -1) return;
      state.template.subTasksGroup[subTaskGroupIndex] = {
        ...state.template.subTasksGroup[subTaskGroupIndex],
        id,
        sector_id,
        position_id,
        name: id
      };
      const _subTasks = state.template.subTasksTemplate.filter((item) => item.parent_id === state.subTaskGroupIdActive);
      _subTasks.forEach((item) => (item.parent_id = id));
      // clear subTaskGroupIdActive
      state.subTaskGroupIdActive = undefined;
    },
    updateDocumentList(state, action: PayloadAction<UploadFile[]>) {
      state.template.documentList = action.payload;
    },
    updateDocumentIdsDelete(state, action: PayloadAction<string>) {
      state.template.delete_document_ids.push(action.payload);
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFormItems.pending, (state) => {
        state.loading = { ...state.loading, loadingFormItems: true };
      })
      .addCase(fetchFormItems.fulfilled, (state, action) => {
        state.formItems = action.payload ?? [];
      })
      .addCase(fetchSectors.fulfilled, (state, action) => {
        state.sectors = action.payload ?? [];
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.positions = action.payload ?? [];
      })
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state) => {
          // Thực hiện công việc "finally" ở đây, ví dụ như reset trạng thái loading
          state.loading = { ...state.loading, loadingFormItems: false };
        }
      );
  }
});

// Action creators are generated for each case reducer function
export const {
  setActiveKeySubTaskList,
  setActiveKeySubTaskListParent,
  setSectorRequired,
  setTemplateName,
  addTemplateItemSubTask,
  sortTemplateItemsSubTask,
  setSubTaskActive,
  setEquipmentsSubTask,
  toggleOpenModal,
  deleteTemplateItem,
  addSubTaskTemplate,
  deleteSubTaskTemplate,
  updateNameSubTaskTemplate,
  setTaskTemplate,
  reset,
  setItemTemplateEdit,
  updateItemTemplate,
  clearItemTemplateEdit,
  addSubTaskGroup,
  setGeneralInfo,
  toggleLoading,
  deleteSubtaskGroup,
  deleteEquipmentSubTask,
  setSubTaskGroupEdit,
  updateSubTaskGroup,
  updateDocumentList,
  updateDocumentIdsDelete
} = templateSlice.actions;

const subTasksTemplate = (state: RootState) => state.templateForm.template.subTasksTemplate;
export const subTasksTemplateGroupSelector = createSelector([subTasksTemplate], (subTasksTemplate) =>
  groupBy(subTasksTemplate, (subTaskTemplate) => subTaskTemplate.parent_id)
);

export default templateSlice.reducer;
