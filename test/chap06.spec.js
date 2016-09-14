"use strict";

// 関数を利用する
// ========

var expect = require('expect.js');


// ## 6.1 関数の基本
describe('関数の基本', () => {
  // ### 関数を定義する
  describe('関数を定義する', () => {
    // 恒等関数
    it('恒等関数', (next) => {
      /* #@range_begin(identity_function_definition) */
      var identity = (any) => {
        return any;
      };
      /* #@range_end(identity_function_definition) */
      expect(
        identity(1)
      ).to.eql(
        1
      );
      expect(
        identity("a")
      ).to.eql(
        "a"
      );
      next();
    });
    // succ関数
    it('succ関数', (next) => {
      /* #@range_begin(succ_function_definition) */
      var succ = (n) => {
        return n + 1;
      };
      /* #@range_end(succ_function_definition) */
      /* テスト */
      expect(
        succ(0)  // 0 を引数にsucc関数を適用する
      ).to.eql(
        1
      );
      expect(
        succ(1)  // 数値1にsucc関数を適用する
      ).to.eql(
        2
      );
      // ~~~
      // node> var succ = (n) => { return n + 1; }; 
      // undefined
      // node> succ("abc")
      // abc1
      // ~~~
      expect(
        succ("abc")
      ).to.eql(
        "abc1"
      );
      next();
    });
    // add関数
    it('add関数', (next) => {
      /* #@range_begin(add_function_definition) */
      /* add:: (NUM, NUM) => NUM */
      var add = (n, m) => {
        return n + m;
      };
      /* #@range_end(add_function_definition) */
      /* テスト */
      expect(
        add(0,1)
      ).to.eql(
        1
      );
      next();
    });
    // 関数の変数へのバインド
    it('関数の変数へのバインド', (next) => {
      /* #@range_begin(function_bound_to_variable) */
      var succ = (x) => {
        return x + 1;
      };
      /* #@range_end(function_bound_to_variable) */
      next();
    });
    it('引数を参照しない関数', (next) => {
      // 定数関数
      /* #@range_begin(constant_one_function) */
      var alwaysOne = (x) => {
        return 1;
      };
      /* #@range_end(constant_one_function) */
      expect(
        alwaysOne(1)
      ).to.eql(
        1
      );
      expect(
        alwaysOne("a")
      ).to.eql(
        1
      );
      // left関数
      /* #@range_begin(left_function) */
      var left = (x,y) => {
        return x;
      };
      /* #@range_end(left_function) */
      expect(
        left(1,2)
      ).to.eql(
        1
      );
      next();
    });
  });
  // ### 関数を適用する
  describe('関数を適用する', () => {
    // succ関数のテスト
    it('succ関数のテスト', (next) => {
      /* #@range_begin(succ_function_test) */
      var succ = (n) => { // nは仮引数 
        return n + 1;
      };
      expect(
        succ(1)  // 数値1にsucc関数を適用する
      ).to.eql(
        2
      );
      /* #@range_end(succ_function_test) */
      next();
    });
    // #### 関数の評価戦略
    describe('関数の評価戦略', () => {
      it('add(succ(0), succ(2))の簡約', (next) => {
        var add = (n, m) => {
          return n + m;
        };
        var succ = (n) => {
          return n + 1;
        };
        expect(
          add(succ(0), succ(2))
        ).to.eql(
          4
        );
        next();
      });
      // JavaScriptにおける正格評価
      it('JavaScriptにおける正格評価', (next) => {
        /* #@range_begin(strict_evaluation_in_javascript) */
        var left = (x,y) => {
          return x;
        };
        var infiniteLoop = (_) => {
          return infiniteLoop(_);
        };
        /* このテストは無限ループになるのでコメントアウトしている
         expect(
           left(1, infiniteLoop())
         ).to.eql(
           1
         )
         */
        /* #@range_end(strict_evaluation_in_javascript) */
        next();
      });
      // 条件文と遅延評価
      it('条件文と遅延評価', (next) => {
        /* #@range_begin(conditional_is_nonstrict) */
        var infiniteLoop = () => {
          return infiniteLoop();
        };

        var conditional = (n) => {
          if(n === 1) {
            return true;
          } else {
            /* 条件文が真の場合には評価されない */
            return infiniteLoop();
          }
        };
        expect(
          conditional(1)
        ).to.eql(
          true // 無限ループに陥ることなく計算に成功する
        );
        /* #@range_end(conditional_is_nonstrict) */
        next();
      });
      it('乗算の遅延評価', (next) => {
        var infiniteLoop = () => {
          return infiniteLoop();
        };
        // 遅延評価で定義したmultiply関数
        /* #@range_begin(multiply_lazy_evaluation) */
        var lazyMultiply = (funX,funY) => {
          var x = funX();

          if(x === 0){
            return 0;          // xが0ならば、funYは評価しない
          } else {
            return x * funY(); // ここで初めてfunYを評価する
          }
        };
        /* #@range_end(multiply_lazy_evaluation) */
        // 遅延評価で定義したmultiply関数のテスト
        /* #@range_begin(multiply_lazy_evaluation_test) */
        expect(
          lazyMultiply((_) => {    // 値を関数でラッピングする
            return 0;
          }, (_) => {
            return infiniteLoop(); // ここが評価されると無限ループに陥る
          })
        ).to.eql(
          0
        );
        /* #@range_end(multiply_lazy_evaluation_test) */
        next();
      });
    });
    // #### サンクで無限を表現する
    describe('サンクで無限を表現する', () => {
      // サンクによるストリーム型の定義
      /* #@range_begin(stream_with_thunk) */
      var stream = {
        match: (data, pattern) => {
          return data(pattern);
        },
        empty: (_) => {
          return (pattern) => {
            return pattern.empty();
          };
        },
        cons: (head,tailThunk) => {
          return (pattern) => {
            return pattern.cons(head,tailThunk);
          };
        },
        /* head:: STREAM[T] => T */
        /* ストリーム型headの定義は、リスト型headと同じ */
        head: (astream) => {
          return stream.match(astream,{
            empty: (_) => { return null; },
            cons: (value, tailThunk) => { return value; }
          });
        },
        /* tail:: STREAM[T] => STREAM[T] */
        tail: (astream) => {
          return stream.match(astream,{
            empty: (_) => { return null; },
            cons: (head, tailThunk) => {
              return tailThunk(); // ここで初めてサンクを評価する
            }
          });
        }
      };
      /* #@range_end(stream_with_thunk) */
      // ストリーム型のテスト
      it("ストリーム型のテスト", (next) => {
        /* #@range_begin(stream_with_thunk_test) */
        var theStream = stream.cons(1, (_) => { // 第2引数にサンクを渡す
          return stream.cons(2,(_) => {         // 第2引数にサンクを渡す
            return stream.empty();
          });
        });
        expect(
          stream.head(theStream)  // ストリームの先頭要素を取り出す
        ).to.eql(
          1
        );
        /* #@range_end(stream_with_thunk_test) */
        next();
      });
      describe("無限ストリームを作る", () => {
        var match = (data, pattern) => {
          return data(pattern);
        };
        var stream = {
          empty: (_) => {
            return (pattern) => {
              return pattern.empty();
            };
          },
          cons: (head,tailThunk) => {
            return (pattern) => {
              return pattern.cons(head,tailThunk);
            };
          },
          /* head:: STREAM[T] => T */
          /* ストリーム型headの定義は、リスト型headと同じ */
          head: (astream) => {
            return match(astream,{
              empty: (_) => { return null; },
              cons: (value, tailThunk) => { return value; }
            });
          },
          /* tail:: STREAM[T] => STREAM[T] */
          tail: (astream) => {
            return match(astream,{
              empty: (_) => { return null; },
              cons: (head, tailThunk) => {
                return tailThunk();  // ここで初めてサンクを評価する
              }
            });
          }
        };
        it("無限の整数列を作る", (next) => {
          // 無限に1が続く数列
          /* #@range_begin(infinite_ones) */
          /* ones = 1,1,1,1,... */
          var ones = stream.cons(1, (_) => {
            return ones; // onesを再帰的に呼び出す
          });
          /* #@range_end(infinite_ones) */
          // 無限に連続する整数列を生成するenumFrom関数
          /* #@range_begin(infinite_integer) */
          var enumFrom = (n) => {
            return stream.cons(n, (_) => {
              return enumFrom(n + 1);
            });
          };
          /* #@range_end(infinite_integer) */
          /* #@range_begin(infinite_ones_test) */
          expect(
            stream.head(ones) // 最初の要素を取りだす
          ).to.eql(
            1
          );
          expect(
            stream.head(stream.tail(ones))  // 2番目の要素を取りだす
          ).to.eql(
            1
          );
          /* #@range_end(infinite_ones_test) */
          next();
        });
        it("無限の整数列をテストする", (next) => {
          this.timeout(3000);
          var enumFrom = (n) => {
            return stream.cons(n, (_) => {
              return enumFrom(n + 1);
            });
          };
          var stream = {
            match: (data, pattern) => {
              return data(pattern);
            },
            empty: (_) => {
              return (pattern) => {
                return pattern.empty();
              };
            },
            cons: (head,tailThunk) => {
              return (pattern) => {
                return pattern.cons(head,tailThunk);
              };
            },
            head: (astream) => {
              return match(astream,{
                empty: (_) => { return null; },
                cons: (value, tailThunk) => { return value; }
              });
            },
            tail: (astream) => {
              return match(astream,{
                empty: (_) => { return null; },
                cons: (head, tailThunk) => {
                  return tailThunk();  
                }
              });
            },
            // ストリームのtake関数
            /* #@range_begin(stream_take) */
            /* take:: (STREAM[T], NUM) => LIST[T] */
            take: (astream, n) => {
              return stream.match(astream,{
                empty: (_) => {              // ストリームが空のケース
                  return list.empty();
                },
                cons: (head,tailThunk) => {  // ストリームが空でないケース 
                  if(n === 0) {
                    return list.empty();
                  } else {
                    return list.cons(head,   // リストを生成する
                                     stream.take(tailThunk(),(n -1)));
                  }
                }
              });
            }
            /* #@range_end(stream_take) */
          };
          expect(
            stream.head(enumFrom(1))
          ).to.eql(
            1
          );
          expect(
            stream.head(stream.tail(enumFrom(1)))
          ).to.eql(
            2
          );
          var list = {
            match: (data, pattern) => {
              return data(pattern);
            },
            empty: (_) => {
              return (pattern) => {
                return pattern.empty();
              };
            },
            cons: (value, list) => {
              return (pattern) => {
                return pattern.cons(value, list);
              };
            },
            isEmpty: (alist) => {
              return match(alist, { 
                empty: true,
                cons: (head, tail) => { 
                  return false;
                }
              });
            },
            head: (alist) => {
              return match(alist, {
                empty: null, 
                cons: (head, tail) => {
                  return head;
                }
              });
            },
            tail: (alist) => {
              return match(alist, {
                empty: null,
                cons: (head, tail) => {
                  return tail;
                }
              });
            },
            // リストのtoArray関数
            /* #@range_begin(list_toArray) */
            toArray: (alist) => {
              var toArrayHelper = (alist,accumulator) => {
                return list.match(alist, {
                  empty: (_) => {
                    return accumulator;
                  },
                  cons: (head, tail) => {
                    return toArrayHelper(tail,
                                         accumulator.concat(head));
                  }
                });
              };
              return toArrayHelper(alist, []);
            }
            /* #@range_end(list_toArray) */
          };
          // 無限の整数列をテストする
          /* #@range_begin(infinite_integer_test) */
          expect(
            list.toArray( // ストリームを配列に変換する
              stream.take(enumFrom(1),4) // 無限の整数列から4個の要素を取り出す 
            )
          ).to.eql(
            [1,2,3,4]
          );
          /* #@range_end(infinite_integer_test) */
          /* #@range_begin(stream_filter_test) */
          expect(
            /* 無限の整数列から最初の4つの要素を取り出し、それを配列に変換する */
            list.toArray(stream.take(enumFrom(1), 4))
          ).to.eql(
            [1,2,3,4]
          );
          /* #@range_end(stream_filter_test) */
          next();
        });
      });
    }); // thunk
  }); // 関数の適用
}); // 関数の基本

// ## 6.2 関数と参照透過性
describe('関数と参照透過性', () => {
  // ### 関数の純粋性
  // succ関数は参照透過性を持つ
  it('succ関数は参照透過性を持つ', (next) => {
    var succ = (n) => {
      return n + 1;
    };
    /* #@range_begin(succ_has_referential_transparency) */
    expect(
      succ(1)
    ).to.eql(
      succ(1)
    );
    /* #@range_end(succ_has_referential_transparency) */
    next();
  });
  // ファイル操作は参照透過性を破壊する
  it('ファイル操作は参照透過性を破壊する', (next) => {
    /* #@range_begin(fileio_destroys_referential_transparency) */
    /* fsモジュールを変数fsにバインドする */
    var fs = require('fs');
    /* テストの実行前にあらかじめ "This is a test."
       という文字列をファイルに書き込んでおく */
    fs.writeFileSync('test/resources/file.txt', "This is a test.");

    /* 第1回目のファイルの読み込み */
    var text = fs.readFileSync("test/resources/file.txt",'utf8');
    expect(
      fs.readFileSync("test/resources/file.txt", 'utf8')
    ).to.eql(
      "This is a test."
    );
    /* 途中でのファイルへの書き込み */
    fs.writeFileSync('test/resources/file.txt',
                     "This is another test.");

    /* 第2回目のファイルの読み込み */
    expect(
      fs.readFileSync("test/resources/file.txt", 'utf8')
    ).to.eql(/* 最初の readFileSync関数の結果と異なっている */
      "This is another test."
    );
    /* #@range_end(fileio_destroys_referential_transparency) */
    next();
  });
  it('画面出力が参照透過性を損なうこと', (next) => {
    /* #@range_begin(log_destroys_referential_transparency) */
    expect(
      console.log("this is a test")
    ).to.eql(
      console.log("this is anoter test")
    );
    /* #@range_end(log_destroys_referential_transparency) */
    next();
  });
  // ### 副作用への対処
  describe('副作用への対処', () => {
    describe('tap関数', () => {
      // tap関数
      /* #@range_begin(tap_combinator) */
      var tap = (target,sideEffect) => {
        sideEffect(target); // 副作用を実行する
        return target;
      };
      /* #@range_end(tap_combinator) */
      // tap関数によるconsole.logのテスト
      it('tap関数によるconsole.logのテスト', (next) => {
        var succ = (n) => {
          return n + 1;
        };
        /* #@range_begin(tap_combinator_test_in_console) */
        /* 画面出力という副作用を実行する関数 */
        var consoleSideEffect = (any) => {
          console.log(any);
        };
        expect(
          tap(succ(1), consoleSideEffect)
        ).to.eql(
          tap(succ(1), consoleSideEffect)
        );
        /* #@range_end(tap_combinator_test_in_console) */
        next();
      });
      // tap関数によるファイル入出力のテスト
      it('tap関数によるファイル入出力のテスト', (next) => {
        var fs = require('fs'); // fsモジュールを変数fsにバインドする
        /* #@range_begin(tap_combinator_test_in_fileio) */
        /* あらかじめ文字列をファイルに書き込んでおく */
        fs.writeFileSync('test/resources/file.txt', "This is a test.");

        /* ファイルからの読み込みという副作用を実行する */
        var IOSideEffect = (_) => {
          var content = fs.readFileSync("test/resources/file.txt",
                                        'utf8');
          fs.writeFileSync('test/resources/file.txt',
                           "This is another test.");
          return content;
        };

        expect(
          tap(fs.readFileSync("test/resources/file.txt", 'utf8'),
              IOSideEffect)
        ).not.to.eql( // 同じ引数に適用しているのに両者は等しくない
          tap(fs.readFileSync("test/resources/file.txt", 'utf8'),
              IOSideEffect)
        );
        /* #@range_end(tap_combinator_test_in_fileio) */
        next();
      });
    });
  });
});

// [目次に戻る](http://akimichi.github.io/functionaljs/) [次章に移る](http://akimichi.github.io/functionaljs/chap07.spec.html) 
