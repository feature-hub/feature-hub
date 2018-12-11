import toposort from 'toposort';

export interface Dependencies {
  readonly [dependencyName: string]: string | undefined;
}

export interface Dependant {
  readonly dependencies?: Dependencies;
}

export type DependencyGraph<TDependant extends Dependant = Dependant> = Map<
  string,
  TDependant
>;

type DependencyEdges = [string, string][];

function createTuple<TFirst, TSecond>(
  first: TFirst
): (second: TSecond) => [TFirst, TSecond] {
  return second => [first, second];
}

function createDependencyEdges(
  dependentName: string,
  dependencies: Dependencies = Object.create(null)
): DependencyEdges {
  return Object.keys(dependencies).map(createTuple(dependentName));
}

function createAllDependencyEdges(
  dependencyGraph: DependencyGraph
): DependencyEdges {
  return Array.from(dependencyGraph.keys()).reduce(
    (allDependencyEdges, dependencyName) => {
      const dependant = dependencyGraph.get(dependencyName);

      /* istanbul ignore next */
      if (!dependant) {
        return allDependencyEdges;
      }

      const dependencyEdges = createDependencyEdges(
        dependencyName,
        dependant.dependencies
      );

      return [...allDependencyEdges, ...dependencyEdges];
    },
    [] as DependencyEdges
  );
}

export function toposortDependencies(
  dependencyGraph: DependencyGraph
): string[] {
  const dependencyNames = Array.from(dependencyGraph.keys());
  const dependencyEdges = createAllDependencyEdges(dependencyGraph);
  const sortedDependencyNames = toposort(dependencyEdges) as string[];

  // Add modules that are not part of sortedDependencyNames because they
  // don't have dependencies and are not a dependency.
  sortedDependencyNames.push(
    ...dependencyNames.filter(
      dependencyName =>
        dependencyGraph.has(dependencyName) &&
        sortedDependencyNames.indexOf(dependencyName) === -1
    )
  );

  // Reverse array to yield execution order.
  return sortedDependencyNames.reverse();
}
