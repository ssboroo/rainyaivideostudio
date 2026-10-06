'use client';
import type {ReactNode} from 'react';
import type {RavsModel} from '@/lib/models';
import {groupModelFamilies} from '@/lib/model-families';

export function ModelFamilies({items,selected,expand=false,renderModel}:{items:RavsModel[];selected?:string;expand?:boolean;renderModel:(model:RavsModel)=>ReactNode}){
 return <div className="modelFamilies">{groupModelFamilies(items).map(family=>{
  const active=family.models.some(m=>m.slug===selected);
  return <details className={'modelFamily'+(active?' selectedFamily':'')} key={family.name} open={expand||active||undefined}>
   <summary className="modelFamilyHead"><span><b>{family.name}</b><small>{family.models.length} горим</small></span></summary>
   <div className="modelFamilyModes">{family.models.map(renderModel)}</div>
  </details>;
 })}</div>;
}
