/**
 * JobMaterialsSection.jsx
 * ------------------------------------------------------------------
 * Wraps the controlled MaterialsEditor for a job whose details are
 * already saved (confirmed/complete): every add/edit/remove is
 * persisted immediately via onSave (useJob().updateMaterials), so
 * the materials list stays live-editable as the job progresses —
 * matching the prototype's behaviour.
 * ------------------------------------------------------------------
 */
import FieldLabel from '../ui/FieldLabel.jsx';
import MaterialsEditor from './MaterialsEditor.jsx';

export default function JobMaterialsSection({ materials, onSave }) {
  return (
    <div style={{ marginTop: 16 }}>
      <FieldLabel style={{ marginBottom: 6 }}>Materials</FieldLabel>
      <MaterialsEditor materials={materials} onChange={onSave} />
    </div>
  );
}
