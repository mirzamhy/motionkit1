import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {TechStudy,ClaudeStudy,ClaudeRollStudy,LongCatStudy} from './Scenes';
const StudyRoot:React.FC=()=> <>
  <Composition id="TechStudy" component={TechStudy} width={1080} height={1080} fps={60} durationInFrames={216}/>
  <Composition id="ClaudeStudy" component={ClaudeStudy} width={1280} height={720} fps={60} durationInFrames={168}/>
  <Composition id="ClaudeRollStudy" component={ClaudeRollStudy} width={1280} height={720} fps={60} durationInFrames={48}/>
  <Composition id="LongCatStudy" component={LongCatStudy} width={1280} height={720} fps={60} durationInFrames={138}/>
</>;
registerRoot(StudyRoot);
