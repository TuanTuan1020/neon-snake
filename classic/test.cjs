// Run: node classic/test.cjs (from repository root). No dependencies required.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const el=()=>({textContent:'',style:{},dataset:{},setAttribute(){},addEventListener(){},getContext(){return {}},blur(){}}),els={};
const sandbox={document:{getElementById:id=>els[id]??=el(),querySelectorAll:()=>[],addEventListener(){},activeElement:el()},window:{addEventListener(){}},localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}},requestAnimationFrame(){},Math};vm.createContext(sandbox);vm.runInContext(script,sandbox);
function check(name,code){vm.runInContext(code,sandbox);console.log('PASS '+name);}
sandbox.assert=assert;
check('starts without storage; reversal rejected',`start();turn('left');assert.equal(queue.length,0);`);
check('two rapid turns buffered without reversing',`turn('up');turn('left');turn('down');assert.equal(queue.length,2);step();assert.deepEqual({...snake[0]},{x:6,y:9});step();assert.equal(snake[0].x,5);`);
check('fruit grows snake and scores',`start();food={x:7,y:10};step();assert.equal(score,10);assert.equal(snake.length,5);assert.ok(!snake.some(s=>equal(s,food)));`);
check('wall ends classic',`start();snake=[{x:19,y:10},{x:18,y:10}];step();assert.equal(state,'over');`);
check('zen wraps edge',`mode='zen';start();snake=[{x:19,y:10},{x:18,y:10}];step();assert.equal(state,'running');assert.equal(snake[0].x,0);`);
check('vacated tail is safe',`start();snake=[{x:2,y:2},{x:2,y:3},{x:1,y:3},{x:1,y:2}];dir=DIR.left;step();assert.equal(state,'running');`);
check('body collision ends game',`start();snake=[{x:2,y:2},{x:2,y:3},{x:1,y:3},{x:1,y:2},{x:1,y:1}];dir=DIR.left;step();assert.equal(state,'over');`);
check('pause clears inputs and resume grants grace',`start();turn('up');pause();assert.equal(state,'paused');assert.equal(queue.length,0);pause();assert.equal(state,'running');assert.ok(grace>=.5);`);
check('gold appears after five fruit and awards 30',`start();eaten=4;food={x:7,y:10};step();assert.ok(gold);assert.ok(!equal(gold,food));gold={x:8,y:10,until:8};step();assert.equal(score,40);assert.equal(gold,null);`);
check('full board wins without infinite spawn loop',`start();snake=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!(x===1&&y===0))snake.push({x,y});dir=DIR.right;food={x:1,y:0};step();assert.equal(state,'won');assert.equal(snake.length,400);`);
check('gold expiry follows active play time',`start();grace=0;gold={x:0,y:0,until:.01};draw=()=>{};frame(50);assert.equal(gold,null);pause();const t=elapsed;frame(100);assert.equal(elapsed,t);`);
