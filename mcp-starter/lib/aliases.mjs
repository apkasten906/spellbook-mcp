export const aliasMap = {
  // dotted -> underscored
  'prompt.read': 'prompt_read',
  'prompt.list': 'prompt_list',
  'prompt.commands': 'prompt_commands',
};

export function normalizeToolName(name) {
  if (!name) return name;
  if (aliasMap[name]) return aliasMap[name];
  // also normalize dotted to underscored generically
  return name.replace(/\./g, '_');
}
