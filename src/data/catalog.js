import { ArrowDownUp, Search, Link2, Layers, Network } from 'lucide-react';

export const CATEGORIES = [
  { id: 'sorting', title: 'Sorting', path: '/sorting', icon: ArrowDownUp, difficulty: 'Beginner to Intermediate', description: 'Watch classic sorts rearrange an array, comparison by comparison.' },
  { id: 'searching', title: 'Searching', path: '/searching', icon: Search, difficulty: 'Beginner', description: 'See how linear and binary search narrow down where a value lives.' },
  { id: 'linked-lists', title: 'Linked Lists', path: '/linked-lists', icon: Link2, difficulty: 'Beginner to Intermediate', description: 'Follow pointers as nodes are inserted, deleted and traversed.' },
  { id: 'stack-queue', title: 'Stacks and Queues', path: '/stacks-queues', icon: Layers, difficulty: 'Beginner', description: 'Compare last-in-first-out with first-in-first-out behaviour.' },
  { id: 'trees', title: 'Binary Trees', path: '/trees', icon: Network, difficulty: 'Intermediate', description: 'Trace preorder, inorder, postorder and level-order traversals.' },
];

const T = (id, category, slug, title, path) => ({ id, category, slug, title, path, available: true });

// Every topic listed here has a working visualizer behind its path.
export const TOPICS = [
  T('sort-bubble', 'sorting', 'bubble', 'Bubble Sort', '/sorting/bubble'),
  T('sort-selection', 'sorting', 'selection', 'Selection Sort', '/sorting/selection'),
  T('sort-insertion', 'sorting', 'insertion', 'Insertion Sort', '/sorting/insertion'),
  T('sort-merge', 'sorting', 'merge', 'Merge Sort', '/sorting/merge'),
  T('sort-quick', 'sorting', 'quick', 'Quick Sort', '/sorting/quick'),
  T('sort-heap', 'sorting', 'heap', 'Heap Sort', '/sorting/heap'),
  T('search-linear', 'searching', 'linear', 'Linear Search', '/searching/linear'),
  T('search-binary', 'searching', 'binary', 'Binary Search', '/searching/binary'),
  T('ll-singly', 'linked-lists', 'singly', 'Singly Linked List', '/linked-lists'),
  T('sq-stack', 'stack-queue', 'stack', 'Stack', '/stacks-queues/stack'),
  T('sq-queue', 'stack-queue', 'queue', 'Queue', '/stacks-queues/queue'),
  T('tree-preorder', 'trees', 'preorder', 'Preorder Traversal', '/trees/preorder'),
  T('tree-inorder', 'trees', 'inorder', 'Inorder Traversal', '/trees/inorder'),
  T('tree-postorder', 'trees', 'postorder', 'Postorder Traversal', '/trees/postorder'),
  T('tree-levelorder', 'trees', 'levelorder', 'Level-order Traversal', '/trees/levelorder'),
];

export const AVAILABLE_TOPICS = TOPICS.filter((t) => t.available);
export const getTopic = (id) => TOPICS.find((t) => t.id === id);
export const topicsIn = (categoryId) => TOPICS.filter((t) => t.category === categoryId);
export const isCategoryAvailable = (categoryId) => topicsIn(categoryId).some((t) => t.available);

const SECTION = {
  sorting: { label: 'Sorting Algorithms', path: '/sorting', category: 'sorting' },
  searching: { label: 'Searching Algorithms', path: '/searching', category: 'searching' },
  'linked-lists': { label: 'Linked Lists', path: '/linked-lists', category: 'linked-lists' },
  'stacks-queues': { label: 'Stacks and Queues', path: '/stacks-queues', category: 'stack-queue' },
  trees: { label: 'Trees', path: '/trees', category: 'trees' },
  practice: { label: 'Practice Arena', path: '/practice' },
  progress: { label: 'My Progress', path: '/progress' },
  settings: { label: 'Settings', path: '/settings' },
};

export function getCrumbs(pathname) {
  const home = { label: 'Home', to: '/' };
  const [first, second] = pathname.split('/').filter(Boolean);
  if (!first) return [{ label: 'Home' }];
  const section = SECTION[first];
  if (!section) return [home, { label: 'Page not found' }];
  const topic = section.category && second && TOPICS.find((t) => t.category === section.category && t.slug === second);
  return topic ? [home, { label: section.label, to: section.path }, { label: topic.title }] : [home, { label: section.label }];
}
