/*                                                                                                               
 * ic3 Web Reporting : initial 3rd-party libraries configuration setup.                                         
 *                                                                                                              
 * http://www.iccube.com/support/documentation/reporting/doc/ic3LocalSettings.html                              
 *                                                                                                              
 */                                                                                                             
                                                                                                                
/*                                                                                                              
 * Optional method to configure which 3rd-party libraries to ignore if not used.                                
 *                                                                                                              
 * @param options {                                                                                             
 *      libs {                                                                                                  
 *         amCharts   : boolean,                                                                                
 *         GoogleMaps : boolean,                                                                                
 *         GoogleViz  : boolean,                                                                                
 *         TinyMCE    : boolean,                                                                                
 *      }                                                                                                       
 *                                                                                                              
 *      request : {                                                                                             
 *         compress: boolean,                                                                                   
 *         compressMinLength: number,                                                                           
 *                                                                                                              
 *         cache: {                                                                                             
 *            enabled                    : boolean,                                                             
 *            maxSize                    : number, - Maximum Cache size (MB)                                    
 *            schemaChangeCheckFrequency : number - How often query server to check is schema have changed (ms) 
 *         }                                                                                                    
 * }                                                                                                            
 *                                                                                                              
 */                                                                                                             
function ic3config(options) {                                                                                   
                                                                                                                
// e.g., loading jQuery from CDN server                                                                         
// options.customLibraries.jquery        = 'https://code.jquery.com/jquery-2.2.4.min.js';                       
                                                                                                                
// e.g., do NOT load jsHint library                                                                             
// options.customLibraries.jshint        = false;                                                               
                                                                                                                
// e.g., do NOT load the Google Visualization library                                                           
// options.libs.GoogleViz = false;                                                                              
                                                                                                                
}