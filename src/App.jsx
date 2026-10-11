import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import SortingVisualizer from './pages/SortingVisualizer.jsx';
import SearchingVisualizer from './pages/SearchingVisualizer.jsx';
import StackQueueVisualizer from './pages/StackQueueVisualizer.jsx';
import LinkedListVisualizer from './pages/LinkedListVisualizer.jsx';
import TreeVisualizer from './pages/TreeVisualizer.jsx';
import PracticeArena from './pages/PracticeArena.jsx';
import Progress from './pages/Progress.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="sorting" element={<Navigate to="/sorting/bubble" replace />} />
        <Route path="sorting/:algo" element={<SortingVisualizer />} />
        <Route path="searching" element={<Navigate to="/searching/linear" replace />} />
        <Route path="searching/:algo" element={<SearchingVisualizer />} />
        <Route path="linked-lists" element={<LinkedListVisualizer />} />
        <Route path="stacks-queues" element={<Navigate to="/stacks-queues/stack" replace />} />
        <Route path="stacks-queues/:kind" element={<StackQueueVisualizer />} />
        <Route path="trees" element={<Navigate to="/trees/preorder" replace />} />
        <Route path="trees/:order" element={<TreeVisualizer />} />
        <Route path="practice" element={<PracticeArena />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
