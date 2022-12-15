import { Component, lazy } from 'solid-js'
import { Routes, Route, Navigate } from '@solidjs/router'

const Memory = lazy(() => import('./pages/Memory'))
// const Home = lazy(() => import('./pages/Home'))

const App: Component = () => {
  return (
    <div class='flex flex-col items-center justify-between min-h-screen w-10/12'>
      <Routes>
        {/* <Route path='/' component={Home} /> */}
        <Route path='/' element={<Navigate href={'/memory'} />} />
        <Route path='/memory' component={Memory} />
      </Routes>
      <footer>
        <small class='mb-2'>
          © {new Date().getFullYear()} vyonizr | v
          {import.meta.env.PACKAGE_VERSION}
        </small>
      </footer>
    </div>
  )
}

export default App
