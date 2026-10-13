import React, { useEffect, useState } from 'react';
import { CrosshairIcon, HouseIcon, LocateFixedIcon, MapIcon, MinusIcon, PlusIcon, Rotate3dIcon, SatelliteIcon, Trash2Icon, BoxIcon } from 'lucide-react';
import { isTrashHot, watchTrashPointer } from '../../utils/trashTarget';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Basemap } from '../../types/plan';

interface MapControlsProps {
  basemap: Basemap;
  canDelete: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGoToCenter: () => void;
  onSaveCenter: () => void;
  onLocate: () => void;
  onBasemap: (basemap: Basemap) => void;
  tilted: boolean;
  onToggleTilt: () => void;
  onDelete: () => void;
}

export function MapControls({
  basemap,
  canDelete,
  onZoomIn,
  onZoomOut,
  onGoToCenter,
  onSaveCenter,
  onLocate,
  onBasemap,
  tilted,
  onToggleTilt,
  onDelete
}: MapControlsProps) {
  const { t } = useLanguage();

  return (
    <>
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 sm:gap-2">
        <div className="flex flex-col overflow-hidden rounded-xl bg-surface shadow-float">
          <ControlButton icon={PlusIcon} label={t('zoomIn')} onClick={onZoomIn} />
          <div className="h-px bg-line" />
          <ControlButton icon={MinusIcon} label={t('zoomOut')} onClick={onZoomOut} />
        </div>
        <div className="flex flex-col overflow-hidden rounded-xl bg-surface shadow-float">
          <ControlButton
            icon={Rotate3dIcon}
            label={tilted ? t('flattenView') : t('tiltView')}
            pressed={tilted}
            onClick={onToggleTilt}
          />
        </div>
        <div className="flex flex-col overflow-hidden rounded-xl bg-surface shadow-float">
          <ControlButton icon={HouseIcon} label={t('goToCenter')} onClick={onGoToCenter} />
          <div className="hidden sm:block">
            <div className="h-px bg-line" />
            <ControlButton icon={CrosshairIcon} label={t('saveCenter')} onClick={onSaveCenter} />
          </div>
          <div className="h-px bg-line" />
          <ControlButton icon={LocateFixedIcon} label={t('showLocation')} onClick={onLocate} />
        </div>
        <div className="flex flex-col overflow-hidden rounded-xl bg-surface shadow-float" role="radiogroup" aria-label={t('baseMap')}>
          <ControlButton
            icon={SatelliteIcon}
            label={t('satellite')}
            pressed={basemap === 'satellite'}
            onClick={() => onBasemap('satellite')}
          />
          <div className="h-px bg-line" />
          <ControlButton
            icon={MapIcon}
            label={t('streetMap')}
            pressed={basemap === 'streets'}
            onClick={() => onBasemap('streets')}
          />
        </div>
      </div>
      {canDelete && <TrashDrop onDelete={onDelete} dropLabel={t('dropToDelete')} deleteLabel={t('delete')} />}
    </>
  );
}

function TrashDrop({ onDelete, dropLabel, deleteLabel }: { onDelete: () => void; dropLabel: string; deleteLabel: string }) {
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const stop = watchTrashPointer();
    const tick = () => setHot(isTrashHot());
    window.addEventListener('pointermove', tick, true);
    window.addEventListener('mousemove', tick, true);
    return () => {
      stop();
      window.removeEventListener('pointermove', tick, true);
      window.removeEventListener('mousemove', tick, true);
    };
  }, []);

  return (
    <button
      type="button"
      data-plan-trash=""
      onClick={onDelete}
      className={`absolute bottom-24 left-1/2 z-10 hidden sm:flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-float transition-colors duration-150 ${
        hot ? 'border-danger bg-danger text-white' : 'border-line bg-surface text-danger hover:bg-danger/10'
      }`}>
      <Trash2Icon className="h-4 w-4" aria-hidden="true" />
      {hot ? dropLabel : deleteLabel}
    </button>
  );
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  pressed = false
}: {
  icon: BoxIcon;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={`group relative grid h-8 w-8 place-items-center transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:h-10 sm:w-10 ${
        pressed ? 'bg-ink text-on-ink' : 'text-ink hover:bg-subtle'
      }`}>
      <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
      <span className="pointer-events-none absolute right-full top-1/2 mr-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-on-ink opacity-0 transition-opacity duration-150 group-hover:opacity-100 lg:block">
        {label}
      </span>
    </button>
  );
}
