import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Books} from './Books';
import {Coffee} from './Coffee';
import {Signal} from './Signal';
const Root:React.FC=()=> <>
  <Composition id="BooksConcept" component={Books} width={1080} height={1080} fps={60} durationInFrames={1200}/>
  <Composition id="CoffeeConcept" component={Coffee} width={1920} height={1080} fps={60} durationInFrames={2160}/>
  <Composition id="SignalConcept" component={Signal} width={1920} height={1080} fps={60} durationInFrames={1500}/>
</>;
registerRoot(Root);
