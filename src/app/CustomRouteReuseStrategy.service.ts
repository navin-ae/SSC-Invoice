import {
  RouteReuseStrategy,
  Route,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
} from '@angular/router';
import {Injectable} from '@angular/core';

@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers = new Map<Route | null, DetachedRouteHandle>();

  /**
   * Determines if a route should be stored for later reuse
   * @param route 
   * @returns 
   */
  public shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Determines if a route should be stored for later reuse
    return route.data['reuse'] === true;
  }

  /**
   * Stores the detached route handle when shouldDetach returns true
   * @param route 
   * @param handle 
   */
  public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // Stores the detached route handle when shouldDetach returns true
    if (handle && route.data['reuse'] === true) {
      const key = this.getRouteKey(route);
      this.handlers.set(key, handle);
    }
  }

  /**
   * Checks if a stored route should be reattached
   * @param route 
   * @returns 
   */
  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Checks if a stored route should be reattached
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true && this.handlers.has(key);
  }

  /**
   * Returns the stored route handle for reattachment
   * @param route 
   * @returns 
   */
  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // Returns the stored route handle for reattachment
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true ? (this.handlers.get(key) ?? null) : null;
  }

  /**
   * Determines if the router should reuse the current route instance. This will re use only 
   * if the route config is the same and not based on parameters.
   * @param future 
   * @param curr 
   * @returns 
   */
  public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Determines if the router should reuse the current route instance
    return future.routeConfig === curr.routeConfig;
  }


  
  private getRouteKey(route: ActivatedRouteSnapshot): Route | null {

    // RouteConfig={route:'/custumers',component:CustomersComponent}. We use this as unique key 
    return route.routeConfig;
  }
}


/**

Angular Router asks 5 questions during navigation:

Should I save this route before leaving?

If yes, where do I save it?

When coming back, should I reuse something I saved?

If yes, give me the saved component

Should I reuse the same component instead of creating a new one?



HANDLE 
Handle is the saved component instance + its view + state
It internally contains:

The component instance

The DOM / view

Child components

Form values

Scroll position

Everything Angular normally destroys

 */