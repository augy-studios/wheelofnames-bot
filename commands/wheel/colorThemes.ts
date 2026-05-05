export const themeDictionary: Record<string, string[]> = {
  'Antarctica evening': ['#F4D3C4', '#F2AEBB', '#D895DA', '#A091D6', '#696FC7', '#A7AAE1'],
  'Beach sunset': ['#3C47C6', '#656CDE', '#DE6CC8', '#F8A091', '#F7E392', '#F7A55D'],
  'Desert scene': ['#FAD381', '#D79F62', '#2E4647', '#518D6A', '#9BC692'],
  'Evening sky': ['#001F38', '#526079', '#9A7E8E', '#E3757F', '#FD997F', '#FFD0AA'],
  'Fresh meadow': ['#84A013', '#A8BB2E', '#D4DA5E', '#EBEF90', '#FBFDBC', '#FAC703'],
  'Fruit tones': ['#E9692C', '#ED9121', '#FFC324', '#FFF000', '#66B447', '#8EE53F'],
  Jellyfish: ['#3EA1B6', '#0E6B8C', '#133855', '#6B669E', '#BB90C8', '#EFD8EC'],
  Monsoon: ['#01A8CA', '#32D1EC', '#F1F1F1', '#AFDFF3'],
  Moon: ['#31302E', '#94908D', '#DAD9D7', '#F0F0F0', '#C3C2BE'],
  'Purple horizon': ['#b7b8f9', '#3a1f8a', '#2c1357', '#462867', '#593b6a'],
  'Red sunset': ['#761000', '#C10900', '#E92100', '#FFDB53', '#FFA93D', '#FF7A29'],
  'Sandy beach': ['#9FE2BF', '#FFE5C6', '#EFCDB4', '#4BC7CF', '#5CF5FF'],
  Underwater: ['#4F42B5', '#82E1E3', '#D4F1F9', '#E3FFFA', '#4CC395'],
  'Water lilies': ['#448036', '#5C9550', '#FBBA37', '#EE6BA4', '#F192B5', '#F4B0C7'],
  'Fall green': ['#529106', '#61A307', '#86B71B', '#B9BD00', '#8EA202', '#799203'],
  'Spring pastels': ['#94DE8B', '#B19CD9', '#F4A8CF', '#F4C3D7', '#FDFD96', '#B6E7B9'],
  'Summer carnival': ['#01A7EC', '#FFFF46', '#FFC94B', '#FE8F5D', '#FE47B3', '#80DA65'],
  'Winter blues': ['#2377A4', '#50A3C6', '#79C0D7', '#F8F8F8', '#DDDFDF', '#C2C2C2'],
  'Anonymous citation': ['#9DC3CA', '#B7D4C6', '#B7D4C6', '#EFECE1', '#EDD5C8', '#F2C0C5'],
  'Lavender to dark blue': ['#FFBAFF', '#DE87FF', '#A455FF', '#681DFF', '#1000CA', '#000098'],
  'Perfect feminine': ['#C09BE3', '#F6E0C7', '#F0C589', '#EA9A5D', '#EA6D63', '#E33F64'],
  Rainbow: ['#D12229', '#F68A1E', '#FDE01A', '#007940', '#24408E', '#732982'],
  Bisexual: ['#D60270', '#9B4F96', '#0038A8'],
  'Non-binary': ['#FcF431', '#FCFCFC', '#9D59D2', '#282828'],
  Transgender: ['#5BCFFB', '#F5ABB9', '#FFFFFF', '#F5ABB9']
};

export const defaultColors = ['#3369e8', '#d50f25', '#eeb211', '#009925'];

export const themeList: { name: string; value: string }[] = Object.keys(themeDictionary).map(
  (name) => ({ name, value: name })
);
