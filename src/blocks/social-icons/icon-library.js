import { __ } from '@wordpress/i18n';
import { Modal, Button, TextControl, SearchControl } from '@wordpress/components';
import { useState, useMemo } from '@wordpress/element';
import { ICON_LIBRARY } from './icons';

export default function IconLibrary( { isOpen, onRequestClose, onSelect } ) {
    const [ searchTerm, setSearchTerm ] = useState( '' );
    const [ activeCategory, setActiveCategory ] = useState( 'All' );

    const filteredIcons = useMemo( () => {
        let all = [];
        Object.entries( ICON_LIBRARY ).forEach( ( [ category, icons ] ) => {
            if ( activeCategory === 'All' || activeCategory === category ) {
                all = [ ...all, ...icons ];
            }
        } );

        if ( searchTerm ) {
            return all.filter( icon => icon.name.toLowerCase().includes( searchTerm.toLowerCase() ) );
        }
        return all;
    }, [ searchTerm, activeCategory ] );

    if ( ! isOpen ) return null;

    return (
        <Modal 
            title={ __( 'Icon Library', 'reusable-component-builder' ) }
            onRequestClose={ onRequestClose }
            className="rcb-icon-library-modal"
            width={ 800 }
        >
            <div className="rcb-icon-library-container" style={{ display: 'flex', gap: '20px', height: '500px' }}>
                <div className="rcb-icon-library-sidebar" style={{ width: '200px', borderRight: '1px solid #ddd', paddingRight: '20px' }}>
                    <div 
                        style={{ cursor: 'pointer', padding: '10px', background: activeCategory === 'All' ? '#f0f0f0' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}
                        onClick={ () => setActiveCategory( 'All' ) }
                    >
                        { __( 'All', 'reusable-component-builder' ) }
                    </div>
                    { Object.keys( ICON_LIBRARY ).map( cat => (
                        <div 
                            key={ cat }
                            style={{ cursor: 'pointer', padding: '10px', background: activeCategory === cat ? '#f0f0f0' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}
                            onClick={ () => setActiveCategory( cat ) }
                        >
                            { cat }
                        </div>
                    ) ) }
                </div>

                <div className="rcb-icon-library-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <SearchControl
                        value={ searchTerm }
                        onChange={ setSearchTerm }
                        placeholder={ __( 'Search Icons...', 'reusable-component-builder' ) }
                    />

                    <div className="rcb-icon-library-grid" style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: '10px',
                        padding: '10px 0'
                    }}>
                        { filteredIcons.map( ( icon, idx ) => (
                            <div 
                                key={ idx } 
                                className="rcb-icon-library-item"
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    padding: '10px', 
                                    border: '1px solid #eee', 
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={ () => onSelect( icon ) }
                                onMouseEnter={ (e) => e.currentTarget.style.borderColor = '#007cba' }
                                onMouseLeave={ (e) => e.currentTarget.style.borderColor = '#eee' }
                            >
                                <div style={{ width: '30px', height: '30px', marginBottom: '5px' }}>{ icon.icon }</div>
                                <div style={{ fontSize: '10px', textAlign: 'center', color: '#666' }}>{ icon.name }</div>
                            </div>
                        ) ) }
                    </div>
                </div>
            </div>
        </Modal>
    );
}
