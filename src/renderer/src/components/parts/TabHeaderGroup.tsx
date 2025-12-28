import { ReactClickEvent } from '@renderer/models/types';
import classNames from 'classnames';
import { useCallback } from 'react';

export interface TabHeaderItem {
  id: string;
  title: string;
  className?: string;
  specialTabType?: string;
}

const TabHeaderGroup: React.FC<{
  selectedId?: string;
  headers: TabHeaderItem[];
  onChange?: (id: string) => void;
  onNew?: (id: string) => void;
}> = ({ selectedId, headers, onChange, onNew }) => {
  const handleClick = useCallback(
    (ev: ReactClickEvent) => {
      if (!onChange) return;

      const target = ev.currentTarget;
      const id = target.dataset['id'];

      if (id && selectedId !== id) {
        const newTab = headers.find((h) => h.id === id);
        if (newTab?.specialTabType === 'new' && onNew) {
          onNew(id);
          return;
        }
        onChange(id);
      }
    },
    [selectedId, onChange, onNew, headers],
  );

  return (
    <div className="tabheader-group">
      {headers.map((header) => (
        <button
          key={header.id}
          data-id={header.id}
          className={
            classNames({
              'tabheader-tab': true,
              selected: selectedId === header.id,
              'tabheader-new': header.specialTabType === 'new',
            }) +
            ' ' +
            (header.className ?? '')
          }
          onClick={handleClick}
        >
          {header.title}
        </button>
      ))}
    </div>
  );
};

export default TabHeaderGroup;
