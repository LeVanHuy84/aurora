export interface PresetEmotion {
  code: string;
  labelKey: string;
  icon: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

export const PRESET_EMOTIONS: PresetEmotion[] = [
  {
    code: 'HAPPY',
    labelKey: 'emotions.happy',
    icon: '😊',
    color: '#F4A261',
    bgLight: '#FFF4EB',
    bgDark: '#2D2218',
  },
  {
    code: 'CALM',
    labelKey: 'emotions.calm',
    icon: '😌',
    color: '#7B9E89',
    bgLight: '#EFF6F2',
    bgDark: '#1A2820',
  },
  {
    code: 'EXCITED',
    labelKey: 'emotions.excited',
    icon: '🤩',
    color: '#E9C46A',
    bgLight: '#FFFBEF',
    bgDark: '#2D2818',
  },
  {
    code: 'LOVED',
    labelKey: 'emotions.loved',
    icon: '🥰',
    color: '#E76F51',
    bgLight: '#FFF0ED',
    bgDark: '#2D1B16',
  },
  {
    code: 'TIRED',
    labelKey: 'emotions.tired',
    icon: '😴',
    color: '#8E7DBE',
    bgLight: '#F5F3FA',
    bgDark: '#221E2C',
  },
  {
    code: 'SAD',
    labelKey: 'emotions.sad',
    icon: '😔',
    color: '#5C80BC',
    bgLight: '#F0F4FA',
    bgDark: '#17202D',
  },
  {
    code: 'STRESSED',
    labelKey: 'emotions.stressed',
    icon: '😤',
    color: '#E63946',
    bgLight: '#FDF0F1',
    bgDark: '#2D1618',
  },
  {
    code: 'GRATEFUL',
    labelKey: 'emotions.grateful',
    icon: '🙏',
    color: '#2A9D8F',
    bgLight: '#EDF7F6',
    bgDark: '#152825',
  },
];
