/**
 * JobMaterialsSection.js
 * ------------------------------------------------------------------
 * Wraps the controlled MaterialsEditor for a job whose details are
 * already saved: every add/edit/remove is persisted immediately via
 * onSave (useJob().updateMaterials -> services/jobService.js).
 * ------------------------------------------------------------------
 */
import { View } from 'react-native';
import FieldLabel from '../ui/FieldLabel';
import MaterialsEditor from './MaterialsEditor';

export default function JobMaterialsSection({ materials, onSave }) {
  return (
    <View style={{ marginTop: 16 }}>
      <FieldLabel style={{ marginBottom: 6 }}>Materials</FieldLabel>
      <MaterialsEditor materials={materials} onChange={onSave} />
    </View>
  );
}
