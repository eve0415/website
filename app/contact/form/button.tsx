'use client';

import { gridItem } from 'styled-system/patterns';

import { buttonStyle } from '../style';

export default function FormButton() {
  return (
    <button
      className={`${buttonStyle} ${gridItem({
        colSpan: 2,
        width: { xlDown: '100%' },
        justifyContent: 'center',
        backgroundColor: 'sky.600',
        cursor: 'pointer',
      })}`}
      onClick={() => {
        console.log('');
      }}
      data-ripplet
    >
      コンタクトフォーム
    </button>
  );
}
