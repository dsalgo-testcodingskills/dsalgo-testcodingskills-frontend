import { toast } from 'react-toastify';
import CustomToast from '../components/CustomToast/CustomToast';

export const checkExpiry = (testId, isExpired) => {
  if (isExpired) {
    // to avoid looping on home route
    if (!window.location.pathname.includes(`/student/test/${testId}`))
      window.location.href = `/student/test/${testId}`;

    // temporary toaster
    toast(
      <CustomToast type="error" message="Sorry, Your test link has expired." />,
    );
  }
};

/**
  @param {number|Date} date date must be epoch time (in ms) or date object
  @param {"full"|"long"|"medium"|"short"} dateStyle Should be one of full, long, medium, short. Default: long
  @param {"full"|"long"|"medium"|"short"} timeStyle should be one of full, long, medium, short. Default: short
* */
export const formatDate = (date, dateStyle = 'long', timeStyle = 'short') => {
  if (!date) {
    return '';
  }
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle,
    timeStyle,
  }).format(date);
};

export const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const getInitials = (name) => {
  let initials;
  const nameSplit = name.split(" ");
  const nameLength = nameSplit.length;
  if (nameLength > 1) {
    initials =
      nameSplit[0].substring(0, 1) +
      nameSplit[nameLength - 1].substring(0, 1);
  } else if (nameLength === 1) {
    initials = nameSplit[0].substring(0, 1);
  } else return;

  return initials.toUpperCase();
};

export const createImageFromInitials = (size, name, color) => {
  if (name == null) return;
  name = getInitials(name)

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = canvas.height = size

  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, size, size)

  context.fillStyle = `${color}50`
  context.fillRect(0, 0, size, size)

  context.fillStyle = color;
  context.textBaseline = 'middle'
  context.textAlign = 'center'
  context.font = `${size / 2}px Roboto`
  context.fillText(name, (size / 2), (size / 2))

  return canvas.toDataURL()
};

export const getConstraintFields = (type) => {
  if (!type) return null;

  if (type.includes('2d_array')) return '2d_array';
  if (type.includes('array')) return 'array';
  if (type === 'int') return 'number';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';

  return null;
};
export function formatTestCaseValue(val, type) {
  if (type !== 'float') {
    if (Array.isArray(val)) return JSON.stringify(val);
    return val ?? '';
  }
  if (val === '' || val == null) return '';
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);

  return Number.isInteger(num) ? `${num}.0` : String(num);
}