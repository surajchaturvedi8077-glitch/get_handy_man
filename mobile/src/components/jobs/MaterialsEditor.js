/**
 * MaterialsEditor.js
 * ------------------------------------------------------------------
 * Controlled add/edit/remove list of a job's materials. Holds no
 * state of its own — receives `materials` and reports every change
 * via `onChange(nextList)`. Used inside JobDetailForm (as part of one
 * batched save) and again on the confirmed job screen, where the
 * parent auto-saves each change immediately (JobMaterialsSection.js).
 * ------------------------------------------------------------------
 */
import { View } from 'react-native';
import MaterialItemRow from './MaterialItemRow';
import Button from '../ui/Button';

export default function MaterialsEditor({ materials = [], onChange }) {
  function updateItem(idx, next) {
    onChange(materials.map((it, i) => (i === idx ? next : it)));
  }
  function removeItem(idx) {
    onChange(materials.filter((_, i) => i !== idx));
  }
  function addItem() {
    onChange([...materials, { name: 'New item', cost: 0 }]);
  }

  return (
    <View>
      {materials.map((m, idx) => (
        <MaterialItemRow key={idx} material={m} onChange={(next) => updateItem(idx, next)} onRemove={() => removeItem(idx)} />
      ))}
      <Button variant="outline" onPress={addItem} style={{ paddingVertical: 9 }}>
        + Add material
      </Button>
    </View>
  );
}
