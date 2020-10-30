import toposort from 'toposort';

export interface Dependencies {
  readonly [dependencyName: string]: string | undefined;
}

export type DependencyGraph = Map<string, Dependencies>;

type DependencyEdges = [string, string][];

function createTuple<TFirst, TSecond>(
  first: TFirst
): (second: TSecond) => [TFirst, TSecond] {
  return (second) => [first, second];
}

function createDependencyEdges(
  dependentName: string,
  dependencies: Dependencies
): DependencyEdges {
  return Object.keys(dependencies).map(createTuple(dependentName));
}

function createAllDependencyEdges(
  dependencyGraph: DependencyGraph
): DependencyEdges {
  return Array.from(dependencyGraph.keys()).reduce(
    (allDependencyEdges, dependencyName) => {
      const dependencies = dependencyGraph.get(dependencyName);

      /* istanbul ignore next */
      if (!dependencies) {
        return allDependencyEdges;
      }

      const dependencyEdges = createDependencyEdges(
        dependencyName,
        dependencies
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
      (dependencyName) =>
        dependencyGraph.has(dependencyName) &&
        sortedDependencyNames.indexOf(dependencyName) === -1
    )
  );

  // Reverse array to yield execution order.
  return sortedDependencyNames.reverse();
}
