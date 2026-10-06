'use client';
import type {ReactNode} from 'react';
import type {RavsModel} from '@/lib/models';
import {groupModelFamilies} from '@/lib/model-families';
import {WorkflowIcon} from '@/components/workflow-icon';

export function ModelFamilies({items,selected,expand=false,renderModel}:{items:RavsModel[];selected?:string;expand?:boolean;renderModel:(model:RavsModel)=>ReactNode}){
 return <div className="modelFamilies">{groupModelFamilies(items).map(family=>{
  const active=family.models.some(m=>m.slug===selected);
  return <details className={'modelFamily'+(active?' selectedFamily':'')} key={family.name} open={expand||active||undefined}>
   <summary className="modelFamilyHead"><i className="modelFamilyIcon" aria-hidden="true"><WorkflowIcon id={family.models[0].slug} size={14}/></i><span><b>{family.name}</b><small>{family.models.length} горим</small></span></summary>
   <div className="modelFamilyModes">{family.models.map(renderModel)}</div>
  </details>;
 })}</div>;
}
