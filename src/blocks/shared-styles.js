import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { SelectControl, RangeControl, TextControl, Button } from '@wordpress/components';

export const SYSTEM_FONTS = [
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
    { label: 'Impact', value: 'Impact, Charcoal, sans-serif' },
    { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive, sans-serif' }
];

export const parseBoxValue = (value) => {
    if (typeof value === 'object' && value !== null) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const normalizedStr = value.replace(/var\(--wp--preset--spacing--([^)]+)\)/g, 'var:preset|spacing|$1');
        const parts = normalizedStr.split(' ').filter(Boolean);
        if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
        if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
        if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
        if (parts.length === 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    }
    return undefined;
};

export const serializeBoxValue = (value) => {
    if (typeof value === 'object' && value !== null) {
        if (!value.top && !value.right && !value.bottom && !value.left) return undefined;
        const formatVal = (v) => {
            if (v === undefined || v === '') return '0px';
            if (String(v).startsWith('var:preset|spacing|')) return `var(--wp--preset--spacing--${v.replace('var:preset|spacing|', '')})`;
            if (!isNaN(v) && v !== '') return `${v}px`;
            return v;
        };
        const t = formatVal(value.top), r = formatVal(value.right), b = formatVal(value.bottom), l = formatVal(value.left);
        if (t === r && r === b && b === l) return t;
        if (t === b && r === l) return `${t} ${r}`;
        return `${t} ${r} ${b} ${l}`;
    }
    return value;
};

export const getResponsiveValue = (val, deviceMode) => {
    if (typeof val === 'object' && val !== null) return val[deviceMode] || val.desktop || '';
    return val || '';
};

export const ResponsiveControl = ({ label, deviceMode, setDeviceMode, children }) => (
    <div className="rcb-responsive-control" style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            {label && <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#1e1e1e' }}>{label}</span>}
            <div className="rcb-device-toggles" style={{ display: 'flex', gap: '2px' }}>
                {['desktop', 'tablet', 'mobile'].map(device => (
                    <Button 
                        key={device} size="small" icon={device === 'mobile' ? 'smartphone' : device} 
                        isPressed={deviceMode === device} onClick={() => setDeviceMode(device)}
                        variant={deviceMode === device ? 'primary' : 'tertiary'}
                        style={{ minWidth: '24px', height: '24px', padding: '0' }}
                    />
                ))}
            </div>
        </div>
        {children}
    </div>
);

export const AdvancedTypographyControl = ({ label, value, fontWeight, textTransform, lineHeight, letterSpacing, fontFamily, onChange, deviceMode, setDeviceMode }) => {
    const themeFonts = useSelect((select) => select('core/block-editor').getSettings()?.fontFamilies || [], []);
    const fontOptions = [{ label: __('Inherit', 'reusable-component-builder'), value: '' }, ...themeFonts.map(f => ({ label: f.name, value: f.fontFamily })), ...SYSTEM_FONTS.filter(sf => !themeFonts.some(tf => tf.fontFamily === sf.value))];
    const getVal = (v) => (typeof v === 'object' && v !== null) ? v[deviceMode] || v.desktop || '' : (v || '');
    const sizeStr = getVal(value).toString(), parsedSize = parseFloat(sizeStr) || 0, sizeUnit = sizeStr.match(/[a-z%]+$/i)?.[0] || 'px';
    const lhStr = getVal(lineHeight).toString(), parsedLH = parseFloat(lhStr) || 1.5;
    const lsStr = getVal(letterSpacing).toString(), parsedLS = parseFloat(lsStr) || 0;
    const labelStyle = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#1e1e1e' };
    return (
        <div className="rcb-advanced-typography" style={{ marginBottom: '24px' }}>
            {label && <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: '#1e1e1e', letterSpacing: '0.5px' }}>{label}</div>}
            <div style={{ marginBottom: '16px' }}>
                <div style={labelStyle}>FONT FAMILY</div>
                <SelectControl value={fontFamily || ''} options={fontOptions} onChange={(val) => onChange('fontFamily', val, false)} __nextHasNoMarginBottom={true} />
            </div>
            <ResponsiveControl label="Font Size" deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1 }}><RangeControl value={parsedSize} onChange={(val) => onChange('fontSize', `${val}${sizeUnit}`, true)} min={8} max={100} withInputField={false} __nextHasNoMarginBottom={true} /></div>
                    <TextControl type="number" value={parsedSize || ''} onChange={(val) => onChange('fontSize', val ? `${val}${sizeUnit}` : '', true)} style={{ width: '55px' }} __nextHasNoMarginBottom={true} />
                    <SelectControl value={sizeUnit} options={[{ label: 'PX', value: 'px' }, { label: 'EM', value: 'em' }, { label: 'REM', value: 'rem' }]} onChange={(newUnit) => onChange('fontSize', parsedSize ? `${parsedSize}${newUnit}` : '', true)} style={{ width: '70px' }} __nextHasNoMarginBottom={true} />
                </div>
            </ResponsiveControl>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}><div style={labelStyle}>Weight</div><SelectControl value={fontWeight || ''} options={[{ label: __('Default', 'reusable-component-builder'), value: '' }, { label: '100', value: '100' }, { label: '200', value: '200' }, { label: '300', value: '300' }, { label: '400', value: '400' }, { label: '500', value: '500' }, { label: '600', value: '600' }, { label: '700', value: '700' }, { label: '800', value: '800' }, { label: '900', value: '900' }]} onChange={(val) => onChange('fontWeight', val, false)} __nextHasNoMarginBottom={true} /></div>
                <div style={{ flex: 1 }}><div style={labelStyle}>Transform</div><SelectControl value={textTransform || ''} options={[{ label: __('None', 'reusable-component-builder'), value: '' }, { label: __('Uppercase', 'reusable-component-builder'), value: 'uppercase' }, { label: __('Lowercase', 'reusable-component-builder'), value: 'lowercase' }, { label: __('Capitalize', 'reusable-component-builder'), value: 'capitalize' }]} onChange={(val) => onChange('textTransform', val, false)} __nextHasNoMarginBottom={true} /></div>
            </div>
            <ResponsiveControl label="Line Height" deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1 }}><RangeControl value={parsedLH} onChange={(val) => onChange('lineHeight', val, true)} min={0.5} max={3} step={0.1} withInputField={false} __nextHasNoMarginBottom={true} /></div>
                    <TextControl type="number" value={parsedLH} onChange={(val) => onChange('lineHeight', val, true)} style={{ width: '65px' }} __nextHasNoMarginBottom={true} />
                </div>
            </ResponsiveControl>
            <ResponsiveControl label="Letter Spacing" deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1 }}><RangeControl value={parsedLS} onChange={(val) => onChange('letterSpacing', `${val}px`, true)} min={-5} max={20} step={1} withInputField={false} __nextHasNoMarginBottom={true} /></div>
                    <TextControl type="number" value={parsedLS} onChange={(val) => onChange('letterSpacing', `${val}px`, true)} style={{ width: '65px' }} __nextHasNoMarginBottom={true} />
                </div>
            </ResponsiveControl>
        </div>
    );
};
