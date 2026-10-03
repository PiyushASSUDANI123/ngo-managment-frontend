import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineSave } from 'react-icons/hi';

const FormBuilderTab = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await API.get('/website/volunteer-config');
      setConfig(res.data);
    } catch (err) {
      toast.error('Failed to load form config');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, field) => {
    setConfig({ ...config, [field]: e.target.value });
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...config.visionPoints];
    newPoints[index] = value;
    setConfig({ ...config, visionPoints: newPoints });
  };

  const addPoint = () => {
    setConfig({ ...config, visionPoints: [...config.visionPoints, ''] });
  };

  const removePoint = (index) => {
    const newPoints = [...config.visionPoints];
    newPoints.splice(index, 1);
    setConfig({ ...config, visionPoints: newPoints });
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...config.formFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setConfig({ ...config, formFields: newFields });
  };

  const addFormField = () => {
    setConfig({ ...config, formFields: [...config.formFields, { name: '', label: '', type: 'text', required: false, placeholder: '' }] });
  };

  const removeFormField = (index) => {
    const newFields = [...config.formFields];
    newFields.splice(index, 1);
    setConfig({ ...config, formFields: newFields });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/website/volunteer-config', config);
      toast.success('Configuration saved successfully');
    } catch (err) {
      toast.error('Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!config) return <div>No config found</div>;

  return (
    <div style={{ padding: '2rem', background: '#fff', borderRadius: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h3>Customize Volunteer Page</h3>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          <HiOutlineSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h4>Page Content</h4>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Title</label>
            <input type="text" className="form-control" value={config.title || ''} onChange={e => handleChange(e, 'title')} />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Subtitle (HTML allowed)</label>
            <textarea className="form-control" rows="3" value={config.subtitle || ''} onChange={e => handleChange(e, 'subtitle')}></textarea>
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Vision Title</label>
            <input type="text" className="form-control" value={config.visionTitle || ''} onChange={e => handleChange(e, 'visionTitle')} />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Vision Text</label>
            <input type="text" className="form-control" value={config.visionText || ''} onChange={e => handleChange(e, 'visionText')} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Vision Points</label>
            {config.visionPoints && config.visionPoints.map((point, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input type="text" className="form-control" value={point} onChange={e => handlePointChange(idx, e.target.value)} />
                <button onClick={() => removePoint(idx)} className="btn-outline" style={{ color: 'red' }}><HiOutlineTrash /></button>
              </div>
            ))}
            <button onClick={addPoint} className="btn-outline" style={{ marginTop: '0.5rem' }}><HiOutlinePlus /> Add Point</button>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Footer Text (HTML allowed)</label>
            <textarea className="form-control" rows="4" value={config.footerText || ''} onChange={e => handleChange(e, 'footerText')}></textarea>
          </div>
        </div>

        <div>
          <h4>Application Form Fields</h4>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>Add or edit fields that volunteers will fill out when applying.</p>
          
          {config.formFields && config.formFields.map((field, idx) => (
            <div key={idx} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', position: 'relative' }}>
              <button onClick={() => removeFormField(idx)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}><HiOutlineTrash size={18} /></button>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem' }}>Field Name (Internal)</label>
                  <input type="text" className="form-control" style={{ padding: '0.4rem' }} value={field.name} onChange={e => handleFieldChange(idx, 'name', e.target.value)} placeholder="e.g. dob" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem' }}>Display Label</label>
                  <input type="text" className="form-control" style={{ padding: '0.4rem' }} value={field.label} onChange={e => handleFieldChange(idx, 'label', e.target.value)} placeholder="e.g. Date of Birth" />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem' }}>Input Type</label>
                  <select className="form-control" style={{ padding: '0.4rem' }} value={field.type} onChange={e => handleFieldChange(idx, 'type', e.target.value)}>
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="url">URL</option>
                    <option value="textarea">Textarea</option>
                    <option value="radio">Radio Buttons</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.2rem' }}>
                  <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(idx, 'required', e.target.checked)} id={`req_${idx}`} />
                  <label htmlFor={`req_${idx}`} style={{ margin: 0, fontSize: '0.85rem' }}>Required Field</label>
                </div>
              </div>

              {(field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'url' || field.type === 'textarea') && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem' }}>Placeholder</label>
                  <input type="text" className="form-control" style={{ padding: '0.4rem' }} value={field.placeholder || ''} onChange={e => handleFieldChange(idx, 'placeholder', e.target.value)} />
                </div>
              )}

              {field.type === 'radio' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem' }}>Options (Comma separated)</label>
                  <input type="text" className="form-control" style={{ padding: '0.4rem' }} value={(field.options || []).join(', ')} onChange={e => handleFieldChange(idx, 'options', e.target.value.split(',').map(s => s.trim()))} placeholder="Option 1, Option 2" />
                </div>
              )}
            </div>
          ))}

          <button onClick={addFormField} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}><HiOutlinePlus /> Add New Field</button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderTab;
