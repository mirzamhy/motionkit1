import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {BooksV2} from './BooksV2';
import {CoffeeV2} from './CoffeeV2';
import {SignalV2} from './SignalV2';
const Root:React.FC=()=> <>
 <Composition id="BooksConcept" component={BooksV2} width={1080} height={1080} fps={60} durationInFrames={1200}/>
 <Composition id="CoffeeConcept" component={CoffeeV2} width={1920} height={1080} fps={60} durationInFrames={2160}/>
 <Composition id="SignalConcept" component={SignalV2} width={1920} height={1080} fps={60} durationInFrames={1500}/>
</>;
registerRoot(Root);
