'use client';

import TextareaAutosize from 'react-textarea-autosize';

import { inputStyle } from './style';

export default function TextInput() {
  return (
    <TextareaAutosize
      name='message'
      inputMode='text'
      color='#E5FCFB'
      className={inputStyle}
      minRows={2}
      autoComplete='off'
      autoFocus
      required
    />
  );
}
