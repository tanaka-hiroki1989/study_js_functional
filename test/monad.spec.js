"use strict";

// さまざまなモナド
// =============

var fs = require('fs');
var expect = require('expect.js');

var pair = {
  match : (data, pattern) => {
    return data.call(data,pattern);
  },
  cons: (left, right) => {
    return (pattern) => {
      return pattern.cons(left, right);
    };
  },
  right: (tuple) => {
    return pair.match(tuple, {
      cons: (left, right) => {
        return right;
      }
    });
  },
  left: (tuple) => {
    return pair.match(tuple, {
      cons: (left, right) => {
        return left;
      }
    });
  }
};

// ## 恒等モナド
// ### 恒等モナドの定義
var ID = {
  /* unit:: T => ID[T] */
  unit: (value) => {  // 単なる identity関数と同じ
    return value;
  },
  /* flatMap:: ID[T] => FUN[T => ID[T]] => ID[T] */
  flatMap: (instanceM) => {
    return (transform) => {
      return transform(instanceM); // 単なる関数適用と同じ
    };
  }
};

// ### 恒等モナドのテスト
describe("恒等モナドをテストする",() => {
  it("ID#unit", (next) => {
    expect(
      ID.unit(1)
    ).to.eql(
      1
    );
    next();
  });
});

// ## Maybeモナド
// ### Maybeモナドの定義
// ~~~haskell
// instance Monad Maybe where
//   Nothing  >>= _ = Nothing
//   (Just x) >>= f = f x
// ~~~
var Maybe = {
  match: (data, pattern) => {
     return data(pattern);
  },
  just : (value) => {
    return (pattern) => {
      return pattern.just(value);
    };
  },
  nothing : (_) => {
    return (pattern) => {
      return pattern.nothing(_);
    };
  },
  // Maybe#unit
  unit : (value) => {
    return Maybe.just(value);
  },
  // Maybe#flatMap
  flatMap : (maybeInstance) => {
    return (transform) => {
      expect(transform).to.a('function');
      return Maybe.match(maybeInstance,{
        just: (value) => {
          return transform(value);
        },
        nothing: (_) => {
          return Maybe.nothing(_);
        }
      });
    };
  },
  // Maybe#map
  // ~~~haskell
  // instance Functor Maybe where
  //    fmap _ Nothing = Nothing
  //    fmap f (Just x) = Just (f x)
  // ~~~
  map : (maybeInstance) => {
    return (transform) => {
      expect(transform).to.a('function');
      return Maybe.match(maybeInstance,{
        nothing: (_) => {
          return Maybe.nothing(_);
        },
        just: (value) => {
          return Maybe.just(transform(value));
        }
      });
    };
  },
  get: (maybe) => {
    return Maybe.getOrElse(maybe)(null);
  },
  getOrElse: (instance) => {
    return (alternate) => {
      return Maybe.match(instance,{
        just: (value) => {
          return value;
        },
        nothing: (_) => {
          return alternate;
        }
      });
    };
  },
  isEqual : (maybeA) => {
    return (maybeB) => {
      return Maybe.match(maybeA,{
        just: (valueA) => {
          return Maybe.match(maybeB,{
            just: (valueB) => {
              return (valueA === valueB);
            },
            nothing: (_) => {
              return false;
            }
          });
        },
        nothing: (_) => {
          return Maybe.match(maybeB,{
            just: (_) => {
              return false;
            },
            nothing: (_) => {
              return true;
            }
          });
        }
      });
    };
  }
};

// ### Maybeモナドのテスト
describe("Maybeモナドをテストする",() => {
  it("Maybe#flatMap", (next) => {
    Maybe.match(Maybe.flatMap(Maybe.just(1))((a) => {
      return Maybe.unit(a);
    }),{
      just: (value) => {
        expect(
          value
        ).to.eql(
          1
        );
      },
      nothing: (_) => {
       expect().fail();
      }
    });
    Maybe.match(Maybe.flatMap(Maybe.nothing())((a) => {
      return Maybe.unit(a);
    }),{
      just: (value) => {
       expect().fail();
      },
      nothing: (_) => {
       expect(true).to.be.ok();
      }
    });
    next();
  });
  it("Maybe#map", (next) => {
    var succ = (n) => { return n + 1;};
    // ~~~haskell
    // > fmap (+1) nothing
    // Nothing
    // ~~~
    expect(
      Maybe.isEqual(
        Maybe.map(Maybe.nothing())(succ)
      )(
        Maybe.nothing()
      )
    ).to.eql(
      true
    );
    expect(
      Maybe.isEqual(
        Maybe.map(Maybe.just(1))(succ)
      )(
        Maybe.just(2)
      )
    ).to.eql(
      true
    );
    next();
  });
  it("add(maybe, maybe)", (next) => {
    var add = (maybeA,maybeB) => {
      return Maybe.flatMap(maybeA)((a) => {
        return Maybe.flatMap(maybeB)((b) => {
          return Maybe.unit(a + b);
        });
      });
    };
    var justOne = Maybe.just(1);
    var justTwo = Maybe.just(2);
    var justThree = Maybe.just(3);
    expect(
      Maybe.isEqual(
        add(justOne,justTwo)
      )(
        justThree
      )
    ).to.eql(
      true
    );
    expect(
      Maybe.isEqual(
        add(justOne,Maybe.nothing())
      )(
        Maybe.nothing()
      )
    ).to.eql(
      true
    );
    next();
  });
});

// ## Eitherモナド
//
// ### Eitherモナドの定義
var Either  = {
  // ~~~haskell
  // data  Either a b  =  Left a | Right b
  // ~~~
  match: (data, pattern) => {
     return data.call(data,pattern);
  },
  left : (value) => {
    return (pattern) => {
      return pattern.left(value);
    };
  },
  right : (value) => {
    return (pattern) => {
      return pattern.right(value);
    };
  },
  // ~~~haskell
  // instance Monad (Either a b) where
  //   return x = Right x
  //   Right x >>= f = f x
  //   Left x >>= Left x
  // ~~~
  // Either#unit
  unit : (value) => {
    return Either.right(value);
  },
  // Either#flatMap
  flatMap : (instanceM) => {
    return (transform) => {
      expect(transform).to.a('function');
      return Either.match(instanceM,{
        right: (value) => {
          return transform(value);
        },
        left: (value) => {
          return Either.left(value);
        }
      });
    };
  },
  // Either#map
  // ~~~haskell
  // instance Functor (Either a) where
  //   fmap f (Right x) = Right (f x)
  //   fmap f (Left x) = Left x
  // ~~~
  map: (instanceM) => {
    return (transform) => {
      return Either.match(instanceM,{
        right: (value) => {
          return Either.right(transform(value));
        },
        left: (value) => {
          return Either.left(value);
        }
      });
    };
  }
};
// ### Eitherモナドのテスト
describe("Eitherモナドをテストする",() => {
  it("数値のときだけ計算が成功する", (next) => {
    Either.match(Either.flatMap(Either.left("wrong"))((n) => {
      return Either.unit(n + 1);
    }),{
      right: (value) => {
        expect().fail();
      },
      left: (value) => {
        expect(
          value
        ).to.eql(
          "wrong"
        );
      }
    });
    Either.match(Either.flatMap(Either.unit(2))((n) => {
      return Either.unit(n + 1);
    }),{
      right: (value) => {
        expect(
          value
        ).to.eql(
          3
        );
      },
      left: (value) => {
        expect().fail();
      }
    });
    next();
  });
});

// ## Listモナド
// ### Listモナドの定義
// ~~~haskell
// instance Monad [] where
//   xs >>= f = concat (map f xs)
//   return x = [x]
//   fail s   = []
// ~~~
var List  = {
  match: (data, pattern) => {
    return data.call(List,pattern);
  },
  empty: (_) => {
    return (pattern) => {
      return pattern.empty();
    };
  },
  cons: (value, alist) => {
    return (pattern) => {
      return pattern.cons(value, alist);
    };
  },
  head: (alist) => {
    return List.match(alist, {
      empty: (_) => {
        return undefined;
      },
      cons: (head, tail) => {
        return head;
      }
    });
  },
  tail: (alist) => {
    return List.match(alist, {
      empty: (_) => {
        return undefined;
      },
      cons: (head, tail) => {
        return tail;
      }
    });
  },
  isEmpty: (alist) => {
    return List.match(alist, {
      empty: (_) => {
        return true;
      },
      cons: (head, tail) => {
        return false;
      }
    });
  },
  // append:: LIST[T] -> LIST[T] -> LIST[T]
  // ~~~haskell
  // append [] ys = ys
  // append (x:xs) ys = x : (xs ++ ys)
  // ~~~
  append: (xs) => {
    return (ys) => {
      return List.match(xs, {
        empty: (_) => {
          return ys;
        },
        cons: (head, tail) => {
          return List.cons(head,List.append(tail)(ys)); 
        }
      });
    };
  },
  // concat:: LIST[LIST[T]] -> LIST[T]
  // ~~~haskell
  // concat [] = []
  // concat (xs:xss) = xs ++ concat xss
  // ~~~
  concat: (xss) => {
    return List.foldr(xss)(List.empty())(List.append);
  },
  join: (xss) => {
    return List.concat(xss);
  },
  // ~~~haskell
  // flatten :: [[a]] -> [a]
  // flatten =  foldr (++) []
  // ~~~
  flatten: (instanceMM) => {
    return List.concat(instanceMM);
  },
  // map:: LIST[T] -> FUN[T->U] -> LIST[U]
  // ~~~haskell
  // map [] _ = []
  // map (x:xs) f = f x : map xs f
  // ~~~
  map: (instanceM) => {
    return (transform) => {
      return List.match(instanceM,{
        empty: (_) => {
          return List.empty();
        },
        cons: (head,tail) => {
          return List.cons(transform(head),
                           List.map(tail)(transform));
        }
      });
    };
  },
  unit: (value) => {
    return List.cons(value, List.empty());
  },
  // ~~~haskell
  // xs >>= f = concat (map f xs)
  // ~~~
  flatMap: (instanceM) => {
    return (transform) => { // FUN[T->LIST[T]]
      expect(transform).to.a('function');
      return List.join(List.map(instanceM)(transform));
      // return List.concat(List.map(instanceM)(transform));
    };
  },
  // 1段階のリストしか配列に変更できない
  toArray: (alist) => {
    return List.foldr(alist)([])((item) => {
      return (accumulator) => {
        return [item].concat(accumulator);
      };
    });
  },
  // foldr:: LIST[T] -> T -> FUN[T -> U -> U] -> T
  // ~~~haskell
  // foldr []     z _ = z
  // foldr (x:xs) z f = f x (foldr xs z f) 
  // ~~~
  foldr: (alist) => {         // alist:: LIST[T]
    return (accumulator) => { // accumulator:: T
      return (glue) => {      // glue:: FUN[T -> U -> U] 
        expect(glue).to.a('function');
        return List.match(alist, {
          empty: (_) => {
            return accumulator;
          },
          cons: (head, tail) => {
            return glue(head)(List.foldr(tail)(accumulator)(glue));;
          }
        });
      };
    };
  }
}; // end of list monad

// ### Listモナドのテスト
describe('Listモナドのテスト', () => {
  describe('List.matchでリストをパターンマッチする', () => {
    // matchでList#emptyをマッチさせる
    it("matchでList#emptyをマッチさせる", (next) => {
      List.match(List.empty,{
        empty: (_) => {
          expect(true).ok();
        },
        cons: (x,xs) => {
          expect().fail();
        }
      });
      next();
    });
    // matchでList#consをマッチさせる
    it("matchでList#consをマッチさせる", (next) => {
      List.match(List.cons(1,List.empty()),{
        empty: (_) => {
          expect().fail();
        },
        cons: (x,xs) => {
          expect(x).to.eql(1);
        }
      });
      next();
    });
  });
  it("List#isEmptyは、リストが空かどうかを判定する", (next) => {
    expect(
      List.isEmpty(List.empty())
    ).to.eql(
      true
    );
    expect(
      List.isEmpty(List.cons(1,List.empty()))
    ).to.eql(
      false
    );
    next();
  });
  it("'List#head'", (next) => {
    expect(
      List.head(List.cons(1,List.empty()))
    ).to.eql(
      1
    );
    next();
  });
  it("'List#tail'", (next) => {
    expect(
      List.head(List.tail(List.cons(1,List.cons(2,List.empty()))))
    ).to.eql(
      2
    );
    next();
  });
  it("'List#append'", (next) => {
    var theList = List.append(List.cons(1,List.empty()))(List.cons(2,List.empty()));
    expect(
      List.head(theList)
    ).to.eql(
      1
    );
    expect(
      List.head(List.tail(theList))
    ).to.eql(
      2
    );
    expect(
      List.isEmpty(List.tail(List.tail(theList)))
    ).to.eql(
      true
    );
    next();
  });
  // List#concatで２つのリストを連結する
  it("List#concatで２つのリストを連結する", (next) => {
    var one_two = List.cons(1,List.cons(2,List.empty()));
    var three_four = List.cons(3,List.cons(4,List.empty()));

    /* list_of_list = [[1,2],[3,4]] */
    var list_of_list = List.cons(one_two,
                                 List.cons(three_four, List.empty()));
    /* concated_list = [1,2,3,4] */
    var concated_list = List.concat(list_of_list);
    expect(
      List.toArray(concated_list)
    ).to.eql(
      [1,2,3,4]
    );
    expect(
      List.head(concated_list)
    ).to.eql(
      1
    );
    expect(
      List.head(List.tail(concated_list))
    ).to.eql(
      2
    );
    expect(
      List.isEmpty(List.tail(List.tail(concated_list)))
    ).to.eql(
      false
    );
    next();
  });
  it("'List#foldr'", (next) => {
    /* list = [1,2,3,4] */
    var theList = List.cons(1,List.cons(2,List.cons(3,List.cons(4,List.empty()),List.empty)));
    expect(
      List.foldr(theList)(0)((item) => {
        return (accumulator) => {
          return accumulator + item;
        };
      })
    ).to.eql(
      10
    );
    next();
  });
  it("'List#map'", (next) => {
    /* list = [1,2,3,4] */
    var theList = List.cons(1,List.cons(2,List.cons(3,List.cons(4,List.empty()),List.empty)));
    expect(
      List.toArray(List.map(theList)((item) => {
        return item * 2;
      }))
    ).to.eql(
      [2,4,6,8]
    );
    next();
  });
  it("'List#unit'", (next) => {
    /* list = [1] */
    expect(
      List.toArray(List.unit(1))
    ).to.eql(
      [1]
    );
    expect(
      List.toArray(List.unit(null))
    ).to.eql(
      [null]
    );
    next();
  });
  describe("List#flatMap", () => {
    it("[1]の要素の2倍は、[2]", (next) => {
      // ~~~haskell
      // Prelude> [1] >>= \x -> [x * 2]
      // [2]
      // ~~~
      var theList = List.cons(1, List.empty());
      expect(
        List.toArray(List.flatMap(theList)((item) => {
          return List.unit(item * 2); 
        }))
      ).to.eql(
        [2]
      );
      next();
    });
    it("[]の要素の2倍は、[]", (next) => {
      // ~~~haskell
      // Prelude> [] >>= \x -> [x * 2]
      // []
      // ~~~
      var emptyList = List.empty();
      expect(
        List.toArray(List.flatMap(emptyList)((item) => {
          return List.unit(item * 2); 
        }))
      ).to.eql(
        []
      );
      next();
    });
    it("[1,2]と[1,2]のそれぞれの要素を足して3になる組み合わせを求める", (next) => {
      var list1 = List.cons(1, List.cons(2,
                                         List.empty()));
      var list2 = List.cons(1, List.cons(2,
                                         List.empty()));
      expect(
        List.toArray(List.flatMap(list1)((item1) => {
          return List.flatMap(list2)((item2) => {
            if(item1 + item2 === 3) {
              return List.unit([item1, item2]);
            } else {
              return List.empty();
            }
          });
        }))
      ).to.eql(
        [[1,2],[2,1]]
      );
      next();
    });
    it("'List#flatMap'", (next) => {
      /* theList = [1,2,3] */
      var theList = List.cons(1,List.cons(2, List.cons(3, List.empty())));
      expect(
        List.toArray(List.flatMap(theList)((item) => {
          return List.append(List.unit(item))(List.unit(- item));
        }))
      ).to.eql(
        [1,-1,2,-2,3,-3]
      );
      next();
    });
  });
  // List#toArrayでリストを配列に変換する
  describe("List#toArrayでリストを配列に変換する", () => {
    it("1段階のリストを配列に変換する", (next) => {
      /* theList = [1,2,3,4] */
      var theList = List.cons(1,List.cons(2,List.cons(3,List.cons(4,List.empty()),List.empty)));
      expect(
        List.toArray(theList)
      ).to.eql(
        [1,2,3,4]
      );
      next();
    });
    it("2段階のリストを配列に変換する", (next) => {
      /* nestedList = [[1],[2]] */
      var nestedList = List.cons(List.cons(1,List.empty()),
                                 List.cons(List.cons(2,List.empty()),
                                           List.empty()));
      expect(
        List.toArray(List.flatMap(nestedList)((alist) => {
          return List.flatMap(alist)((item) => {
            return List.unit(item);
          });
        }))
      ).to.eql(
        [1,2]
      );
      next();
    });
  });
  describe("Listモナドを活用する",() => {
    // 素数を判定するisPrimeを定義する
    it("素数を判定するisPrimeを定義する", (next) => {
      var enumFromTo = (x,y) => {
        if(x > y) {
          return List.empty();
        } else {
          return List.cons(x, enumFromTo(x+1,y));
        }
      };
      // ~~~haskell
      // factors :: Int -> [Int]
      // factors n = [x | x <- [1..n], n `mod` x == 0]
      // ~~~
      var factors = (n) => {
        return List.flatMap(enumFromTo(1,n))((x) => {
          if((n % x) === 0){
            return List.unit(x);
          } else {
            return List.empty(); 
          }
        });
      };
      expect(
        List.toArray(factors(15))
      ).to.eql(
        [1,3,5,15]
      );
      expect(
        List.toArray(factors(7))
      ).to.eql(
        [1,7]
      );
      // isPrime関数
      // ~~~haskell
      // isPrime :: Int -> Bool
      // isPrime n = factors n == [1,n]
      // ~~~
      var isPrime = (n) => {
        return List.toArray(factors(n)) === List.toArray(enumFromTo(1,n));
      };
      expect(
        isPrime(15)
      ).to.eql(
        false
      );
      expect(
        isPrime(13)
      ).to.eql(
        false
      );
      next();
    });
    it("フィルターとして使う", (next) => {
      var even = (n) => {
        if(n % 2 === 0) {
          return true;
        } else {
          return false;
        }
      };
      var theList = List.cons(1,List.cons(2,List.cons(3,List.cons(4,List.empty()))));
      expect(
        List.toArray(List.flatMap(theList)((item) => {
          if(even(item)) {
            return List.unit(item);
          } else {
            return List.empty();
          }
        }))
      ).to.eql(
        [2,4]
      );
      next();
    });
    it("2段階のflatMap", (next) => {
      var theNumberList = List.cons(1,List.cons(2,List.empty()));
      var theStringList = List.cons("one",List.cons("two",List.empty()));
      expect(
        List.toArray(List.flatMap(theNumberList)((n) => {
          return List.flatMap(theStringList)((s) => {
            return List.unit([n,s]);
          });
        }))
      ).to.eql(
        [[1,"one"],[1,"two"],[2,"one"],[2,"two"]]
      );
      next();
    });
    describe("Maybeと一緒に使う", () => {
      it("[just(1)]", (next) => {
        var theList = List.cons(Maybe.just(1),
                                List.empty());
        var justList = List.flatMap(theList)((maybeItem) => {
          return Maybe.flatMap(maybeItem)((value) => {
            return List.unit(value);
          });
        });
        expect(
          List.toArray(justList)
        ).to.eql(
          [1]
        );
        next();
      });
      it("[just(1),just(2)]", (next) => {
        var theList = List.cons(Maybe.just(1),
                                List.cons(Maybe.just(2),List.empty()));
        var justList = List.flatMap(theList)((listItem) => {
          return Maybe.flatMap(listItem)((value) => {
            return List.unit(value);
          });
        });
        expect(
          List.toArray(justList)
        ).to.eql(
          [1,2]
        );
        next();
      });
    });
  });
});

// ## Streamモナド
// ### Streamモナドの定義
var Stream = {
  match: (data, pattern) => {
     return data.call(Stream,pattern);
  },
  // Stream#unit
  /* unit:: ANY -> STREAM */
  unit: (value) => {
    if(value != null){
      return Stream.cons(value, (_) => {
        return Stream.empty();
      });
    } else {
      return Stream.empty();
    }
  },
  empty: (_) => {
    return (pattern) => {
      expect(pattern).to.an('object');
      return pattern.empty();
    };
  },
  cons: (head,tailThunk) => {
    expect(tailThunk).to.a('function');
    return (pattern) => {
      expect(pattern).to.an('object');
      return pattern.cons(head,tailThunk);
    };
  },
  /* head:: STREAM -> MAYBE[STREAM] */
  head: (lazyList) => {
    return Stream.match(lazyList,{
      empty: (_) => {
        return Maybe.nothing();
      },
      cons: (value, tailThunk) => {
        return Maybe.just(value);
      }
    });
  },
  /* tail:: STREAM -> MAYBE[STREAM] */
  tail: (lazyList) => {
    return Stream.match(lazyList,{
      empty: (_) => {
        return Maybe.nothing();
      },
      cons: (head, tailThunk) => {
        return Maybe.just(tailThunk());
      }
    });
  },
  isEmpty: (lazyList) => {
    return Stream.match(lazyList,{
      empty: (_) => {
        return true;
      },
      cons: (head,tailThunk) => {
        return false;
      }
    });
  },
  // Stream#toArray
  toArray: (lazyList) => {
    return Stream.match(lazyList,{
      empty: (_) => {
        return [];
      },
      cons: (head,tailThunk) => {
        if(Stream.isEmpty(tailThunk())){
          return [head];
        } else {
          return [head].concat(Stream.toArray(tailThunk()));
        }
      }
    });
  },
  // Stream#map
  map: (lazyList) => {
    return (transform) => {
      return Stream.match(lazyList,{
        empty: (_) => {
          return Stream.empty();
        },
        cons: (head,tailThunk) => {
          return Stream.cons(transform(head),(_) => {
            return Stream.map(tailThunk())(transform)});
        }
      });
    };
  },
  // Stream#append
  append: (xs) => {
    return (ysThunk) => {
      return Stream.match(xs,{
        empty: (_) => {
          return ysThunk();
        },
        cons: (head,tailThunk) => {
          return Stream.cons(head,(_) => {
            return Stream.append(tailThunk())(ysThunk);
          });
        }
      });
    };
  },
  // Stream#concat
  /* concat:: STREAM[STREAM[T]] -> STREAM[T] */
  concat: (astream) => {
    return Stream.match(astream,{
      empty: (_) => {
        return Stream.empty();
      },
      cons: (head,tailThunk) => {
        return Stream.append(head,tailThunk());
      }
    });
  },
  // Stream#flatten
  /* flatten :: STREAM[STREAM[T]] => STREAM[T] */
  flatten: (lazyList) => {
    return Stream.match(lazyList,{
      empty: (_) => {
        return Stream.empty();
      },
      cons: (head,tailThunk) => {
        return Stream.append(head)((_) => {
          return Stream.flatten(tailThunk());
        });
      }
    });
  },
  // Stream#flatMap
  // flatMap:: STREAM[T] -> FUNC[T->STREAM[T]] -> STREAM[T]
  // ~~~haskell
  // flatMap xs f = flatten (map f xs)
  //~~~
  flatMap: (lazyList) => {
    return (transform) => {
      return Stream.flatten(Stream.map(lazyList)(transform));
    };
  },
  // monad.stream#foldr
  foldr: (instanceM) => {
    return (accumulator) => {
      return (glue) => {
        expect(glue).to.a('function');
        return Stream.match(instanceM,{
          empty: (_) => {
            return accumulator;
          },
          cons: (head,tailThunk) => {
            return glue(head)(Stream.foldr(tailThunk())(accumulator)(glue));
          }
        });
      };
    };
  }
};

// ### Streamモナドのテスト
describe('Streamモナドのテスト', () => {
  it("Stream#unit", (next) => {
    Stream.match(Maybe.nothing(null),{
      nothing: (_) => {
        return expect(
          _
        ).to.eql(
          null
        );
      },
      just: (value) => {
        return expect().fail();
      }
    });
    var lazyList = Stream.unit(1);
    expect(
      Maybe.get(Stream.head(lazyList))
    ).to.eql(
      1
    );
    expect(
      Maybe.get(Stream.head(Stream.unit(1)))
    ).to.eql(
      1
    );
    expect(
      Maybe.get(Stream.head(Stream.unit(0)))
    ).to.eql(
      0
    );
    next();
  });
  it("Stream#cons", (next) => {
    var lazyList = Stream.cons(1, (_) => {
      return Stream.cons(2,(_) => {
        return Stream.empty();
      });
    });
    expect(
      Maybe.get(Stream.head(lazyList))
    ).to.eql(
      1
    );
    next();
  });
  it("Stream#tail", (next) => {
    /* lazyList = [1,2] */
    var lazyList = Stream.cons(1, (_) => {
      return Stream.cons(2,(_) => {
        return Stream.empty();
      });
    });
    expect(
      Stream.tail(lazyList)
    ).to.a("function");

    Stream.match(Stream.tail(lazyList),{
      nothing: (_) => {
        expect().fail();
      },
      just: (tail) => {
        Stream.match(tail,{
          empty: (_) => {
            expect().fail();
          },
          cons: (head, tailThunk) => {
            expect(head).to.eql(2);
          }
        });
      }
    });
    expect(
      Maybe.get(Stream.head(Maybe.get(Stream.tail(lazyList))))
    ).to.eql(
      2
    );
    next();
  });
  it("Stream#toArray", (next) => {
    expect(
      Stream.toArray(Stream.empty())
    ).to.eql(
      []
    );
    expect(
      Stream.toArray(Stream.unit(1))
    ).to.eql(
      [1]
    );
    next();
  });
  it("Stream#append", (next) => {
    var xs = Stream.cons(1, (_) => {
      return Stream.empty();
    });
    var ysThunk = (_) => {
      return Stream.cons(2, (_) => {
        return Stream.empty();
      });
    };
    var theStream = Stream.append(xs)(ysThunk);
    expect(
      Maybe.get(Stream.head(theStream))
    ).to.eql(
      1
    );
    expect(
      Maybe.get(Stream.head(Maybe.get(Stream.tail(theStream))))
    ).to.eql(
      2
    );
    next();
  });
  it("Stream#flatten", (next) => {
    /* innerStream = [1,2] */
    var innerStream = Stream.cons(1, (_) => {
      return Stream.cons(2,(_) => {
        return Stream.empty();
      });
    });
    /* outerStream = [[1,2]] */
    var outerStream = Stream.unit(innerStream);
    var flattenedStream = Stream.flatten(outerStream);
    Stream.match(flattenedStream,{
      empty: (_) => {
        expect().fail()
      },
      cons: (head,tailThunk) => {
        expect(head).to.eql(1)
      }
    });
    expect(
      Maybe.get(Stream.head(flattenedStream))
    ).to.eql(
      1
    );
    expect(
      Maybe.get(Stream.head(Maybe.get(Stream.tail(flattenedStream))))
    ).to.eql(
      2
    );
    next();
  });
  describe("Stream#map", () => {
    it("mapで要素を2倍にする", (next) => {
      /* lazyList = [1,2] */
      var lazyList = Stream.cons(1, (_) => {
        return Stream.cons(2,(_) => {
          return Stream.empty();
        });
      });
      var doubledLazyList = Stream.map(lazyList)((item) => {
        return item * 2;
      });
      expect(
        Maybe.get(Stream.head(doubledLazyList))
      ).to.eql(
        2
      );
      expect(
        Maybe.get(Stream.head(Maybe.get(Stream.tail(doubledLazyList))))
      ).to.eql(
        4
      );
      expect(
        Stream.toArray(doubledLazyList)
      ).to.eql(
        [2,4]
      );
      next();
    });
    it("無限の整数列を作る", (next) => {
      var ones = Stream.cons(1, (_) => {
        return ones;
      });
      expect(
        Maybe.get(Stream.head(ones))
      ).to.eql(
        1
      );
      expect(
        Maybe.get(Stream.head(Maybe.get(Stream.tail(ones))))
      ).to.eql(
        1
      );
      var twoes = Stream.map(ones)((item) => {
        return item * 2;
      });
      expect(
        Maybe.get(Stream.head(twoes))
      ).to.eql(
        2
      );
      expect(
        Maybe.get(Stream.head(Maybe.get(Stream.tail(twoes))))
      ).to.eql(
        2
      );
      expect(
        Maybe.get(Stream.head(Maybe.get(Stream.tail(Maybe.get(Stream.tail(twoes))))))
      ).to.eql(
        2
      );
      next();
    });
    it("整数列を作る", (next) => {
      var integersFrom = (from) => {
        return Stream.cons(from, (_) => {
          return integersFrom(from + 1);
        });
      };
      expect(
        Maybe.get(Stream.head(integersFrom(0)))
      ).to.eql(
        0
      );
      expect(
        Maybe.get(Stream.head(Maybe.get(Stream.tail(integersFrom(0)))))
      ).to.eql(
        1
      );
      var doubledIntergerMapped = Stream.map(integersFrom(0))((integer) => {
        return integer * 2;
      });
      expect(
        Maybe.get(Stream.head(doubledIntergerMapped))
      ).to.eql(
        0
      );
      expect(
        Maybe.get(Stream.head(Maybe.get(Stream.tail(doubledIntergerMapped))))
      ).to.eql(
        2
      );
      var doubledInterger = Stream.flatMap(integersFrom(0))((integer) => {
        return Stream.unit(integer * 2);
      });
      expect(
        Maybe.get(Stream.head(doubledInterger))
      ).to.eql(
        0
      );
      expect(
        Maybe.get(Stream.head(Maybe.get(Stream.tail(doubledInterger))))
      ).to.eql(
        2
      );
      next();
    });
    it("一段階のflatMap", (next) => {
      var ones = Stream.cons(1, (_) => {
        return ones;
      });
      var twoes = Stream.flatMap(ones)((one) => {
        expect(one).to.a('number');
        return Stream.unit(one * 2);
      });
      expect(
        Maybe.get(Stream.head(twoes))
      ).to.eql(
        2
      );
      next();
    });
    it("二段階のflatMap", (next) => {
      // ~~~scala
      // scala> val nestedNumbers = List(List(1, 2), List(3, 4))
      // scala> nestedNumbers.flatMap(x => x.map(_ * 2))
      // res0: List[Int] = List(2, 4, 6, 8)
      // ~~~
      var innerStream12 = Stream.cons(1, (_) => {
        return Stream.cons(2,(_) => {
          return Stream.empty();
        });
      });
      var innerStream34 = Stream.cons(3, (_) => {
        return Stream.cons(4,(_) => {
          return Stream.empty();
        });
      });
      /* nestedStream = [[1,2],[3,4]] */
      var nestedStream = Stream.cons(innerStream12, (_) => {
        return Stream.cons(innerStream34,(_) => {
          return Stream.empty();
        });
      });
      var flattenedStream = Stream.flatMap(nestedStream)((innerStream) => {
        return Stream.flatMap(innerStream)((n) => {
          expect(n).to.a('number');
          return Stream.unit(n * 2);
        });
      });
      expect(
        Maybe.get(Stream.head(flattenedStream))
      ).to.eql(
        2
      );
      expect(
        Stream.toArray(flattenedStream)
      ).to.eql(
        [2,4,6,8]
      );
      next();
    });

  });
}); // Streamモナド




// ## Readerモナド
// ### Readerモナドの定義
// ~~~haskell
// newtype Reader e a = Reader { runReader :: e -> a }
//
// instance Monad (Reader env) where
//     return a = Reader $ \_ -> a
//     m >>= f  = Reader $ \env -> runReader (f (runReader m env)) env
// ~~~
var Reader = {
  unit: (x) => {
    return {
      // runReader :: Reader r a -> r -> a
      run: (_) => {
        return x;
      }
    };
  },
  flatMap: (reader) => {
    return (f) => { // transform:: a -> a
      return {
        run: (env) => {
          return f(reader.run(env)).run(env);
        }
      };
    };
  },
  // ask = Reader id
  ask: (x) => {
    return {
      run: (env) => {
        return env;
      }
    };
  }
};

// ### Readerモナドのテスト
describe("Readerモナドをテストする",() => {
  it("add10", (next) => {
    // ~~~haskell
    // add10 :: Reader Int Int
    // add10 = do
    //   x <- ask                          -- 環境変数(x=1)を得る
    //   y <- local (+1) add10             -- localの使用例, y=12
    //   s <- reader . length . show $ x   -- 返り値は自由である例
    //  return (x+10)    
    // main = print $ runReader add10 1
    // ~~~
    var add10 = Reader.flatMap(Reader.ask())((x) => {
      return Reader.unit(x + 10);
    });
    expect(
      add10.run(1)
    ).to.eql(
      11
    );
    next();
  });
});

// ## Writerモナド
// ### Writerモナドの定義
// ~~~haskell
// newtype Writer w a = Writer { run :: (a,w) }
//
// instance (Monoid w) => Monad (Writer w) where
//     return a = Writer (a, empty)
//     (Writer (a, v)) >>= f  = let (Writer (b, v')) = f a
//                              in Writer (b, v `append`v')
// ~~~
var Writer = {
  unit: (a) => {
    return {
      run: (_) => {
        return pair.cons(List.empty(),a);
      }
    };
  },
  flatMap: (writer) => {
    var writerPair = writer.run();
    var v = pair.left(writerPair);
    var a = pair.right(writerPair);
    return (f) => { // transform:: a -> a
      var newPair = f(a).run();
      var v_ = pair.left(newPair);
      var b = pair.right(newPair);
      return {
        run: () => {
          return pair.cons(List.append(v)(v_),b);
        }
      };
    };
  },
  // ~~~haskell
  // tell :: Monoid w => w -> Writer w ()  -- tell関数は、値wをもとにログを作成する
  // tell s = Writer ((), s)
  // ~~~
  tell: (s) => {
    return {
      run: (_) => {
        return pair.cons(s, List.empty());
      }
    };
  }
};

// ### Writerモナドのテスト
describe("Writerモナドをテストする",() => {
  // ~~~haskell
  // factW :: Int -> Writer [Int] Int
  // factW 0 = tell [0] >> return 1
  // factW n = do
  //   tell [n]
  //   n1 <- factW (pred n)
  //   return $ n * n1
  // ~~~
  // 実行する場合はrunWriter
  // ~~~haskell
  // *Main> runWriter $ factW 5
  // (120,[5,4,3,2,1,0])
  // ~~~
  it("factorial", (next) => {
    var pred = (n) => {
      return n - 1;
    };
    var factorial = (n) => {
      if(n === 0) {
        return Writer.flatMap(Writer.tell(List.unit(0)))((_) => {
          return Writer.unit(1);
        });
      } else {
        return Writer.flatMap(Writer.tell(List.unit(n)))((_) => {
          return Writer.flatMap(factorial(pred(n)))((n1) => {
            return Writer.unit(n * n1);
          });
        });
      }
    };
    pair.match(factorial(0).run(),{
      cons: (left, right) => {
        expect(
          List.toArray(left)
        ).to.eql(
          [0]
        );
        expect(
          right
        ).to.eql(
          1
        );
      }
    });
    pair.match(factorial(5).run(),{
      cons: (left, right) => {
        expect(
          List.toArray(left)
        ).to.eql(
          [5,4,3,2,1,0]
        );
        expect(
          right
        ).to.eql(
          120
        );
      }
    });
    next();
  });
});

// ## IOモナド
// ### IOモナドの定義
var IO = {
  // unit:: T => IO[T]
  unit : (any) => {
    return (_) =>  { // 外界は明示する必要はありません
      return any;
    };
  },
  /* flatMap:: IO[T] => FUN[T => IO[U]] => IO[U] */
  flatMap : (instanceA) => {
    return (actionAB) => { // actionAB:: a -> IO[b]
      return IO.unit(IO.run(actionAB(IO.run(instanceA))));
    };
  },
  // IO.done関数
  // 
  // > IOアクションを何も実行しない
  /* done:: T => IO[T] */
  done : (any) => {
    return IO.unit();
  },
  // IO.run関数
  //
  // > IOアクションを実行する
  /* run:: IO[A] => A */
  run : (instanceM) => {
    return instanceM();
  },
  // readFile:: STRING => IO[STRING]
  readFile : (path) => {
    return (_) => {
      var content = fs.readFileSync(path, 'utf8');
      return IO.unit(content)(_);
    };
  },
  // println:: STRING => IO[null]
  println : (message) => {
    return (_) => {
      console.log(message);
      return IO.unit(null)(_);
    };
  },
  writeFile : (path) => {
    return (content) => {
      return (_) => {
        fs.writeFileSync(path,content);
        return IO.unit(null)(_);
      };
    };
  },
  // IO.seq:: IO[a] => IO[b] => IO[b]
  seq: (instanceA) => {
    return (instanceB) => {
      return IO.flatMap(instanceA)((a) => {
        return instanceB;
      });
    };
  },
  seqs: (alist) => {
    return List.foldr(alist)(List.empty())(IO.done());
  },
  // IO.putc:: CHAR => IO[]
  putc: (character) => {
    return (io) => {
      process.stdout.write(character);
      return null;
    };
  },
  // IO.puts:: LIST[CHAR] => IO[]
  // ~~~haskell
  // puts list = seqs (map putc list)
  // ~~~
  puts: (alist) => {
    return List.match(alist, {
      empty: () => {
        return IO.done();
      },
      cons: (head, tail) => {
        return IO.seq(IO.putc(head))(IO.puts(tail));
      }
    });
  },
  // IO.getc :: IO[CHAR]
  getc: () => {
    var continuation = () => {
      var chunk = process.stdin.read();
      return chunk;
    }; 
    process.stdin.setEncoding('utf8');
    return process.stdin.on('readable', continuation);
  }
};

describe("IOモナドをテストする",() => {
});



describe("Maybeと一緒に使う", () => {
  it("[just(1),just(2)]", (next) => {
    var theList = List.cons(Maybe.just(1),
                            List.cons(Maybe.just(2),List.empty()));
    var justList = List.flatMap(theList)((listItem) => {
      return Maybe.flatMap(listItem)((value) => {
        return List.unit(value);
      });
    });
    expect(
      List.toArray(justList)
    ).to.eql(
      [1,2]
    );
    next();
  });
  it("[just(1)]", (next) => {
    var theList = List.cons(Maybe.just(1),
                            List.empty());
    var justList = List.flatMap(theList)((maybeItem) => {
      return Maybe.flatMap(maybeItem)((value) => {
        return List.unit(value);
      });
    });
    expect(
      List.toArray(justList)
    ).to.eql(
      [1]
    );
    next();
  });
});


// ## STモナド
// ### STモナドの定義
// 
// Programming in Haskell(2版),p.168..p.172 を参照。
//
// ~~~haskell
// newtype ST a = S(State -> (a, State))
//
// app :: ST a -> State -> (a,State)
// app (S st) x = st x
//
// instance Monad ST where
//   -- (>>=) :: ST a -> (a -> ST b) -> ST b
//   st >>= f = S(\state -> 
//                   let (x, state') = app st state 
//                   in app (f x) state'
//               )
//   unit :: a -> ST a
//   unit x = S(\s -> (x,s))
// ~~~
//
var ST = {
  unit: (value) => { 
    return (state) => { 
      return pair.cons(value,state);
    };
  },
  app: (st) => {
    return (state) => {
      return st(state);
    };
  },
  flatMap: (instanceM) => {
    return (f) => { // f:: ST a
      expect(f).to.a('function');
      return (state) => {
        var newState = ST.app(instanceM)(state);
        return pair.match(newState,{
          cons:(x, state_) => {
            return ST.app(f(x))(state_);
          }
        });
      };
    };
  },
  // ~~~haskell
  // (<*>) :: ST(a -> b) -> ST a -> ST b
  // stf <*> stx = S(\s ->
  //   let (f,s') = app stf s
  //       (x,s'') = app stx s' 
  //   in (f x, s'')
  // ~~~
  fresh: (state) => {
    return pair.cons(state, state + 1);
  }
};

// ### STモナドのテスト
describe("STモナドをテストする",() => {
  describe("Treeの例",() => {
    // ~~~haskell
    // data Tree a = Leaf a | Node (Tree a) (Tree a)
    // ~~~
    var Tree = {
      match: (data, pattern) => {
       return data.call(data, pattern);
      },
      leaf: (value) => {
         return (pattern) => {
           return pattern.leaf(value);
         };
      },
      node: (left, right) => {
         return (pattern) => {
           return pattern.node(left, right);
         };
      },
      toArray: (tree) => {
        return Tree.match(tree,{
          leaf:(value) => {
            return value;
          },
          node:(left, right) => {
            return [Tree.toArray(left), Tree.toArray(right)];
          }
        });
      },
      // ~~~haskell
      // fmap f (Leaf x) = Leaf (f x)
      // fmap f (Node left right) = Node (fmap f left) (fmap f right)
      // ~~~
      map: (f) => {
        return (tree) => {
          return Tree.match(tree,{
            leaf:(value) => {
              return Tree.leaf(f(value));
            },
            node:(left, right) => {
              return Tree.node(Tree.map(f)(left),Tree.map(f)(right) );
            }
          });
        };
      },
      fresh: (state) => {
        return pair.cons(state, state + 1);
      }
    };
    it('Tree.toArray', (next) => {
      expect(
        Tree.toArray(Tree.leaf(1))
      ).to.eql(
        1
      );
      expect(
        Tree.toArray(Tree.node(Tree.leaf(1),Tree.leaf(2)))
      ).to.eql(
        [1,2]
      );
      expect(
        Tree.toArray(Tree.node(Tree.leaf(1),
                               Tree.node(Tree.leaf(2),Tree.leaf(3))))
      ).to.eql(
        [1,[2,3]]
      );
      next();
    });
    it('rlabel', (next) => {
      // ~~~haskell
      // rlabel :: (TREE, STATE) -> (TREE,STATE)
      // ~~~
      var rlabel = (tree, state) => {
        return Tree.match(tree,{
          leaf:(value) => {
            return pair.cons(Tree.leaf(state), state + 1);
          },
          node:(left, right) => {
            var leftNode = rlabel(left, state);
            var rightNode = rlabel(right, pair.right(leftNode));
            return pair.cons(Tree.node(pair.left(leftNode), 
                                       pair.left(rightNode)), 
                             pair.right(rightNode));
          }
        });
      };
      expect(
        Tree.toArray(pair.left(rlabel(Tree.leaf(1),0)))
      ).to.eql(
        0
      );
      expect(
        Tree.toArray(pair.left(rlabel(Tree.node(Tree.leaf("a"),Tree.leaf("b")),0)))
      ).to.eql(
        [0,1]
      );
      next();
    });
    it('mlabel', (next) => {
      var fresh = (state) => {
        return pair.cons(state, state + 1);
      };
      // ~~~haskell
      // mlabel :: Tree a -> ST(Tree Int)
      // mlabel (Leaf _) = do n <- fresh
      //                      return (Leaf n)
      // mlabel (Node left right) = do left' <- mlabel left
      //                               right' <- mlabel right
      //                               return (Node left' right')
      // ~~~
      var mlabel = (tree) => {
        return Tree.match(tree,{
          leaf:(_) => {
            return ST.flatMap(fresh)((n) => {
              return ST.unit(Tree.leaf(n));
            });
          },
          node:(left, right) => {
            return ST.flatMap(mlabel(left))((left_) => {
              return ST.flatMap(mlabel(right))((right_) => {
                return ST.unit(Tree.node(left_, right_));
              });
            });
          }
        });
      }; 
      expect(
        Tree.toArray(
          pair.left(ST.app(mlabel(Tree.leaf(1)))(0))
        )
      ).to.eql(
        0
      );
      expect(
        Tree.toArray(
          pair.left(ST.app(mlabel(Tree.node(Tree.leaf("a"),Tree.leaf("b"))))(0))
        )
      ).to.eql(
        [0,1]
      );
      next();
    });
  });
});

// ## Contモナド
// ### Contモナドの定義
// 
//
// ~~~haskell
// newtype Cont r a = Cont { runCont :: ((a -> r) -> r) } -- r は計算全体の最終の型
// instance Monad (Cont r) where 
//     return a       = Cont $ \k -> k a                       
//     -- i.e. return a = \k -> k a 
//     (Cont c) >>= f = Cont $ \k -> c (\a -> runCont (f a) k) 
//     -- i.e. m >>= f = \k -> m (\a -> f a k) 
// ~~~
//
// instance Monad (Cont r) where
//     return x = Cont (\k -> k x)
//     m >>= f = Cont (\k -> runCont m (\a -> runCont (f a) k))

var Cont = {
  unit: (k) => {  // k:: a -> r
    return (n) => {
      return k(n);
    };
  },
  flatMap: (m) => {
    return (f) => { // f:: Int -> Cont r Int
      expect(f).to.a('function');
      return Cont.unit((k) => {
        return m((a) => {
          return f(a)(k);
        });
      });
    };
  },
  // ~~~haskell
  // class Monad m => MonadCont m where
  //   callCC :: ((a -> m a) -> m a) -> m a
  // instance MonadCont (Cont r) where
  //   callCC f = Cont $ \k -> runCont (f (\a -> Cont $ \_ -> k a)) k
  //   -- i.e.  callCC f = \k -> ((f (\a -> \_ -> k a)) k)
  // ~~~
  callCC: (f) => {
    return (k) =>{ 
      return f((a) => {
        return (_) => {
          return k(a);
        }; 
      })(k);
    };
  }
};

// ### Contモナドのテスト
describe("Contモナドをテストする",() => {
  // ~~~haskell
  // *Main> let s3 = Cont (square 3)
  // *Main> print =: runCont s3
  // 9 
  // ~~~
  var identity = (x) => {
    return x;
  };
  it('square', (next) => {
    // ~~~haskell
    // square :: Int -> ((Int -> r) -> r)
    // square x = \k -> k (x * x)
    // ~~~
    var squareCPS = (n) => {
      return (k) => {
        return k(n * n);
      }; 
    };
    var square3 = Cont.unit(squareCPS(3));
    expect(
      square3(identity)
    ).to.eql(
      9
    );
    next();
  });
  it('pythagoras', (next) => {
    // ~~~haskell
    // squareCont x = Cont (\k -> k (x * x))
    // addCont x y = Cont (\k -> k (x + y))
    // pythagoras2 :: Int -> Int -> Cont r Int
    // pythagoras2 n m = do
    //     x <- squareCont n
    //     y <- squareCont m
    //     result <- addCont x y
    //     return result
    // $ ghci cps.hs 
    // *Main> print =: runCont (pythagoras2 2 3)
    // 13
    // ~~~
    var addCont = (x,y) => {
      return Cont.unit((k) => {
        return k(x + y);
      }); 
    };
    // ~~~haskell
    // *Main> let { m :: Cont r Int; m = return 3 }
    // *Main> let { f :: Int -> Cont r Int; f x = Cont (square x) }
    // *Main> let result = m >>= f
    // *Main> print =: runCont result
    // 9 
    // ~~~
    var squareCont = (n) => {
      return Cont.unit((k) => {
        return k(n * n);
      }); 
    };
    expect(
      squareCont(2)(identity)
    ).to.eql(
      4
    );
    var m = Cont.unit((k) => {
      return k(3);
    });
    var f = (x) => {
      return squareCont(x);
    };
    expect(
      Cont.flatMap(m)((k) => {
        return squareCont(k);
      })(identity)
    ).to.eql(
      9
    );
    var pythagoras2 = (n,m) => {
      return Cont.flatMap(squareCont(n))((x) => {
        return Cont.flatMap(squareCont(m))((y) => {
          return Cont.flatMap(addCont(x,y))((answer) => {
            return Cont.unit((k) => {
              return k(answer);
            });
          });
        });
      });
    };
    expect(
      pythagoras2(2,3)(identity)
    ).to.eql(
      13
    );
    next();
  });
});
// [目次に戻る](index.html) 
