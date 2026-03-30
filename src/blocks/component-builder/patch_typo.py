import re

with open('/var/www/html/learn-pro/wp-content/plugins/reusable-component-builder/src/blocks/component-builder/edit.js', 'r') as f:
    content = f.read()

# Make sure we don't conflict, replace the entire AdvancedTypographyControl
start_pattern = "const AdvancedTypographyControl ="
end_pattern = "export default function Edit("

start_idx = content.find(start_pattern)
end_idx = content.find(end_pattern)

if start_idx != -1 and end_idx != -1:
    before = content[:start_idx]
    after = content[end_idx:]
    
    new_typo = """const AdvancedTypographyControl = ({ label, value, fontWeight, textTransform, lineHeight, letterSpacing, fontFamily, onChange }) => {
    const themeFonts = useSelect((select) => {
        const settings = select('core/block-editor').getSettings();
        return settings?.fontFamilies || [];
    }, []);

    const fontOptions = [
        { label: __('Inherit', 'reusable-component-builder'), value: '' },
        ...themeFonts.map(f => ({ label: f.name, value: f.fontFamily })),
        ...SYSTEM_FONTS.filter(sf => !themeFonts.some(tf => tf.fontFamily === sf.value))
    ];

    const valString = (value || '').toString();
    const parsedValue = parseFloat(valString) || 0;
    const unitMatch = valString.match(/[a-z%]+$/i);
    const unit = unitMatch ? unitMatch[0] : 'px';

    const labelStyle = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#1e1e1e' };
    
    return (
        <div className="rcb-advanced-typography" style={{ marginBottom: '24px', padding: '0 4px' }}>
            {label && <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: '#1e1e1e', letterSpacing: '0.5px' }}>{label}</div>}
            
            <div style={{ marginBottom: '16px' }}>
                <div style={labelStyle}>FONT FAMILY</div>
                <SelectControl
                    value={fontFamily || ''}
                    options={fontOptions}
                    onChange={(val) => onChange('fontFamily', val)}
                    __nextHasNoMarginBottom={true}
                />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#757575' }}>Size</span>
                    <SelectControl
                        value={unit}
                        options={[
                            { label: 'PX', value: 'px' }, { label: 'EM', value: 'em' }, { label: 'REM', value: 'rem' }
                        ]}
                        onChange={(newUnit) => onChange('fontSize', parsedValue ? `${parsedValue}${newUnit}` : '')}
                        style={{ minWidth: '70px' }}
                        __nextHasNoMarginBottom={true}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <RangeControl
                            value={parsedValue}
                            onChange={(newVal) => onChange('fontSize', newVal !== undefined ? `${newVal}${unit}` : '')}
                            min={0}
                            max={unit === 'px' ? 100 : 10}
                            step={unit === 'px' ? 1 : 0.1}
                            withInputField={false}
                            __nextHasNoMarginBottom={true}
                        />
                    </div>
                    <TextControl
                        type="number"
                        value={parsedValue}
                        onChange={(newVal) => onChange('fontSize', newVal !== undefined ? `${newVal}${unit}` : '')}
                        style={{ width: '50px' }}
                        __nextHasNoMarginBottom={true}
                    />
                    <Button isSmall variant="secondary" onClick={() => onChange('fontSize', '')} style={{ height: '30px' }}>Reset</Button>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                    <div style={labelStyle}>WEIGHT</div>
                    <SelectControl
                        value={fontWeight || ''}
                        options={[
                            { label: 'Default', value: '' }, { label: 'Normal', value: 'normal' }, { label: 'Bold', value: 'bold' },
                            { label: '300', value: '300' }, { label: '400', value: '400' }, { label: '500', value: '500' },
                            { label: '600', value: '600' }, { label: '700', value: '700' }, { label: '800', value: '800' }
                        ]}
                        onChange={(val) => onChange('fontWeight', val)}
                        __nextHasNoMarginBottom={true}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={labelStyle}>TRANSFORM</div>
                    <SelectControl
                        value={textTransform || ''}
                        options={[
                            { label: 'Default', value: '' }, { label: 'Uppercase', value: 'uppercase' },
                            { label: 'Lowercase', value: 'lowercase' }, { label: 'Capitalize', value: 'capitalize' }
                        ]}
                        onChange={(val) => onChange('textTransform', val)}
                        __nextHasNoMarginBottom={true}
                    />
                </div>
            </div>

            {/* Line Height Control */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={labelStyle}>LINE HEIGHT</div>
                    <Button isSmall variant="link" onClick={() => onChange('lineHeight', '')} style={{ fontSize: '10px', textDecoration: 'none', color: '#757575' }}>Reset</Button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TextControl
                        type="number"
                        value={parseFloat(lineHeight) || ''}
                        onChange={(val) => onChange('lineHeight', val)}
                        style={{ width: '50px' }}
                        __nextHasNoMarginBottom={true}
                    />
                    <div style={{ flex: 1 }}>
                        <RangeControl
                            value={parseFloat(lineHeight) || 1.5}
                            onChange={(val) => onChange('lineHeight', val)}
                            min={0.5}
                            max={3}
                            step={0.1}
                            withInputField={false}
                            __nextHasNoMarginBottom={true}
                        />
                    </div>
                </div>
            </div>

            {/* Letter Spacing Control */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={labelStyle}>LETTER SPACING</div>
                    <Button isSmall variant="link" onClick={() => onChange('letterSpacing', '')} style={{ fontSize: '10px', textDecoration: 'none', color: '#757575' }}>Reset</Button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TextControl
                        type="number"
                        value={parseInt(letterSpacing) || 0}
                        onChange={(val) => onChange('letterSpacing', `${val}px`)}
                        style={{ width: '50px' }}
                        __nextHasNoMarginBottom={true}
                    />
                    <div style={{ flex: 1 }}>
                        <RangeControl
                            value={parseInt(letterSpacing) || 0}
                            onChange={(val) => onChange('letterSpacing', `${val}px`)}
                            min={-5}
                            max={20}
                            step={1}
                            withInputField={false}
                            __nextHasNoMarginBottom={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

"""
    
    new_content = before + new_typo + after
    with open('/var/www/html/learn-pro/wp-content/plugins/reusable-component-builder/src/blocks/component-builder/edit.js', 'w') as f:
        f.write(new_content)
    print("Typography UI replaced")
else:
    print("Could not find AdvancedTypographyControl pattern")
