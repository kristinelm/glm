/*                                                                                          
 * ic3 Web Reporting : specific JS code available to all reports.                           
 *                                                                                          
 * https://www.iccube.com/support/documentation/reporting/doc/ic3LocalSettings.html         
 */                                                                                         
                                                                                            
/*                                                                                          
 * Optional method to load JS libraries.                                                    
 *                                                                                          
 * @param options {                                                                         
 *      root      the path to the ic3report application that contains the lib directory     
 *                e.g., /icCube/doc/ic3-report/app/                                         
 *                                                                                          
 *      rootLocal the path that contains this file                                          
 *                e.g., /icCube/doc/ic3-report/app-local/                                   
 *                                                                                          
 *      callback  the function to call when the local processing is done                    
 * }                                                                                        
function ic3bootstrapLocal(options) {                                                       
                                                                                            
   // Add your code that is loading your libraries...                                       
                                                                                            
   // Once done notify the caller                                                           
   options.callback && options.callback();                                                  
}                                                                                           
*/                                                                                          
                                                                                            
                                                                                            
/* Your standard JS code (the reporting library is loaded and the user is not logged) */    
