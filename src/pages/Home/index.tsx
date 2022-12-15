import { createSignal, createMemo } from 'solid-js'
import { Routes, Route, A } from '@solidjs/router'
import type { Component } from 'solid-js'
import { MetaProvider, Title } from '@solidjs/meta'

const App: Component = () => {
  return (
    <MetaProvider>
      <Title>Nekta</Title>
      <div>
        <h1 class='text-3xl'>Nekta</h1>
        <h2>Modules</h2>
        <ul>
          <li>
            <A href='/memory'>Memory</A>
          </li>
        </ul>
      </div>
    </MetaProvider>
  )
}

export default App
