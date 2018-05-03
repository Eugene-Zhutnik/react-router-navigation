/* @flow */

import * as React from 'react'
import {
  matchPath,
  type RouterHistory,
  type Location,
  type Match,
} from 'react-router'
import type { Route, RouteProps } from './TypeDefinitions'

type Props = Route &
  RouteProps & {
    history: RouterHistory,
  }

type State = {|
  location: Location,
  match: ?Match,
|}

class SceneView extends React.Component<Props, State> {
  unlisten: ?Function

  constructor(props: Props) {
    super(props)
    const { history, routeMatch } = props
    this.state = { match: routeMatch || null, location: history.location }
    this.unlisten = history.listen(this.onHistoryChange)
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten()
  }

  onHistoryChange = (location: Location) => {
    const { routePath, path, exact, strict } = this.props
    const { match: oldMatch } = this.state
    const minimalRoute = { path: routePath || path, exact, strict }
    const minimalMatch = matchPath(location.pathname, minimalRoute)
    const route = { path, exact, strict }
    const match = matchPath(location.pathname, route)
    if (
      match &&
      minimalMatch &&
      (!oldMatch || (oldMatch.url !== match.url && oldMatch.url.includes(minimalMatch.url)))
    ) {
      this.setState({ match, location })
    } else {
      this.setState({ location })
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return !!nextState.match
  }

  render() {
    const { render, children, component: Component, history } = this.props
    const { match, location } = this.state
    const contextRouter = { history, match, location }
    if (render) {
      return render(contextRouter)
    } else if (children && typeof children === 'function') {
      return children(contextRouter)
    } else if (children && React.Children.count(children) === 0) {
      return React.cloneElement(children, contextRouter)
    } else if (Component) {
      return (
        <Component
          match={contextRouter.match}
          location={contextRouter.location}
          history={contextRouter.history}
        />
      )
    }
    return null
  }
}

export default SceneView
