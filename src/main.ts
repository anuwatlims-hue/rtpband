import './styles.css';
import { content } from './data/content';
import { mount } from './lib/app';

mount(document.getElementById('app')!, content);
