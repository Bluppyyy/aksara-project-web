import { useState } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import layout from './AuthLayout.module.css';

/** Input kata sandi dengan tombol tampil/sembunyikan */
export default function PasswordInput({ id, invalid, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`${layout.inputGroup} ${invalid ? layout.inputInvalid : ''}`}>
      <input id={id} type={visible ? 'text' : 'password'} aria-invalid={invalid || undefined} {...props} />
      <button
        type="button"
        className={layout.eyeButton}
        aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <Icon icon="lucide:eye-off" size={18} /> : <Icon icon="lucide:eye" size={18} />}
      </button>
    </div>
  );
}
