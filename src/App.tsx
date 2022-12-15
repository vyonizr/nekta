import { lazy } from 'solid-js'
import { Routes, Route, Navigate } from '@solidjs/router'
import type { Component } from 'solid-js'
const Memory = lazy(() => import('./pages/Memory'))
const Home = lazy(() => import('./pages/Home'))

import styles from './App.module.css'

const App: Component = () => {
  return (
    <Routes>
      {/* <Route path='/' component={Home} /> */}
      <Route path='/' element={<Navigate href={'/memory'} />} />
      <Route path='/memory' component={Memory} />
    </Routes>
  )
}

export default App
