import type {Metadata} from 'next';
import {CreateStudio} from './studio';
import './studio.css';
export const metadata:Metadata={title:'RAINY Create — Санаанаас бэлэн бичлэг',description:'Монгол дуу оруулалттай AI видео. Нэг хүсэлт, нэг төлбөр, нэг бэлэн MP4.'};
export default function CreatePage(){return <CreateStudio/>;}
