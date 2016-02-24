/*

 ----------------------------------------------------------------------------
 | ewd-qoper8.js: Node.js Queue and Multi-process Manager                   |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  24 January 2016

*/

function getUpTime(startTime) {
  var sec = (new Date().getTime() - startTime)/1000;
  var hrs = Math.floor(sec / 3600);
  sec %= 3600;
  var mins = Math.floor(sec / 60);
  if (mins < 10) mins = '0' + mins;
  sec = Math.floor(sec % 60);
  if (sec < 10) sec = '0' + sec;
  var days = Math.floor(hrs / 24);
  hrs %= 24;
  return days + ' days ' + hrs + ':' + mins + ':' + sec;
}

function upTime() {
  return getUpTime(this.startTime);
}

module.exports = upTime;