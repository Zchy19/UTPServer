define(['lodash', 'services/diffSequenceService'], function(_, diffSequenceService) {
	function calculateDiffService() {
    function compileJSONPointer (path) {
      return path
        .map(p => ('/' + String(p)
            .replace(/~/g, '~0')
            .replace(/\//g, '~1')
        ))
        .join('')
    }

    const CREATE = 'create'
    const UPDATE = 'update'
    const DELETE = 'delete'
    const CHILD_UPDATE = 'child-update'

    this.memoizedCalculateDiffWithMaps = function(leftContent, rightContent) {
      try {
        // note that parseContent can throw an exception when the content is text containing invalid JSON
        const left = leftContent
        const right = rightContent
        
        const diff = calculateDiffWithMaps(left, right);
        return diff
      } catch (error) {
        return {
          changes: [],
          diffLeft: {},
          diffRight: {},
          error
        }
      }
    }

    function calculateDiffWithMaps (left, right) {
      const changes = calculateDiff(left, right)

      return {
        diffLeft: createDiffMapLeft(changes),
        diffRight: createDiffMapRight(changes),
        changes
      }
    }

    function calculateDiff (left, right) {
      const changes = []
    
      function _calculateDiff (left, right, pathLeft, pathRight) {
        // iterate over two arrays
        if (Array.isArray(left) && Array.isArray(right)) {
          arrayDiff(left, right, (change, aIndex, bIndex) => {
            const childPathLeft = pathLeft.concat([aIndex])
            const childPathRight = pathRight.concat([bIndex])

            if (change === CREATE) {
              changes.push({ change: CREATE, pathRight: childPathRight, valueRight: right[bIndex] })
            } else if (change === UPDATE) {
              _calculateDiff(left[aIndex], right[bIndex], childPathLeft, childPathRight)
            } else if (change === DELETE) {
              changes.push({ change: DELETE, pathLeft: childPathLeft, valueLeft: left[aIndex] })
            }
          })

          return
        }

        // iterate over two objects
        if (isObject(left) && isObject(right)) {
          const uniqueKeys = new Set(Object.keys(left).concat(Object.keys(right)))

          uniqueKeys.forEach(key => {
            const childPathLeft = pathLeft.concat([key])
            const childPathRight = pathRight.concat([key])

            _calculateDiff(left[key], right[key], childPathLeft, childPathRight)
          })

          return
        }

        // compare any mix of primitive values or Array or Object
        if (left !== right) {
          // since we already checked whether both left and right are an Array or both are an Object,
          // we can only end up when they are not both an Array or both an Object. Hence, they
          // switched from Array to Object or vice versa
          const switchedArrayOrObjectType = Array.isArray(left) || isObject(left) || Array.isArray(right) || isObject(right)

          if (left !== undefined && right !== undefined && !switchedArrayOrObjectType) {
            changes.push({ change: UPDATE, pathLeft, pathRight, valueLeft: left, valueRight: right })
          } else {
            if (left !== undefined) {
              changes.push({ change: DELETE, pathLeft, valueLeft: left })
            }
            if (right !== undefined) {
              changes.push({ change: CREATE, pathRight, valueRight: right })
            }
          }
        }
      }

      _calculateDiff(left, right, [], [])

      return changes
    }

    function createDiffMapLeft (changes) {
      const diffLeft = {}

      for (const { change, pathLeft, valueLeft } of changes) {
        if (change === DELETE || change === UPDATE) {
          const pathLeftPointer = compileJSONPointer(pathLeft)

          diffLeft[pathLeftPointer] = change

          // loop over all parent paths to mark them as having a changed child
          forEachParent(pathLeft, path => {
            const pathPointer = compileJSONPointer(path)
            if (!diffLeft[pathPointer]) {
              diffLeft[pathPointer] = CHILD_UPDATE
            }
          })

          // loop over all children to mark them created or deleted
          if (change === DELETE && (Array.isArray(valueLeft) || isObject(valueLeft))) {
            traverse(valueLeft, pathLeft, (value, childPath) => {
              const childPathPointer = compileJSONPointer(childPath)
              diffLeft[childPathPointer] = change
            })
          }
        }
      }

      return diffLeft
    }

    function createDiffMapRight (changes) {
      const diffRight = {}

      for (const { change, pathRight, valueRight } of changes) {
        if (change === CREATE || change === UPDATE) {
          const pathRightPointer = compileJSONPointer(pathRight)
          diffRight[pathRightPointer] = change

          // loop over all parent paths to mark them as having a changed child
          forEachParent(pathRight, path => {
            const pathPointer = compileJSONPointer(path)
            if (!diffRight[pathPointer]) {
              diffRight[pathPointer] = CHILD_UPDATE
            }
          })

          // loop over all children to mark them created or deleted
          if (change === CREATE && (Array.isArray(valueRight) || isObject(valueRight))) {
            traverse(valueRight, pathRight, (value, childPath) => {
              const childPathPointer = compileJSONPointer(childPath)
              diffRight[childPathPointer] = change
            })
          }
        }
      }

      return diffRight
    }

    function arrayDiff (a, b, callback) {
      const diff = []
      let aIndex = 0
      let bIndex = 0

      function isCommon (aIndex, bIndex) {
        return _.isEqual(a[aIndex], b[bIndex])
      }

      function foundSubsequence (nCommon, aCommon, bCommon) {
        const aCount = aCommon - aIndex
        const bCount = bCommon - bIndex
        const updateCount = Math.min(aCount, bCount)

        for (let uIndex = 0; uIndex < updateCount; uIndex++) {
          callback(UPDATE, aIndex, bIndex)
          aIndex++
          bIndex++
        }

        while (aIndex < aCommon) {
          callback(DELETE, aIndex, bIndex)
          aIndex++
        }

        while (bIndex < bCommon) {
          callback(CREATE, aIndex, bIndex)
          bIndex++
        }

        aIndex += nCommon
        bIndex += nCommon
      }

      diffSequenceService.diffSequence(a.length, b.length, isCommon, foundSubsequence)
      foundSubsequence(0, a.length, b.length)

      return diff
    }

    function traverse (json, path, callback) {
      callback(json, path)

      if (Array.isArray(json)) {
        for (let i = 0; i < json.length; i++) {
          traverse(json[i], path.concat([i]), callback)
        }
      } else if (isObject(json)) {
        Object.keys(json).forEach(key => {
          traverse(json[key], path.concat([key]), callback)
        })
      }
    }

    function forEachParent (path, callback) {
      for (let index = path.length - 1; index >= 0; index--) {
        const parentPath = path.slice(0, index)
        callback(parentPath)
      }
    }

    function isObject (json) {
      return json != null && typeof json === 'object' && !Array.isArray(json)
    }
  }
  return new calculateDiffService();
})
