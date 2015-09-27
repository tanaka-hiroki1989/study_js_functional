"use strict";

var expect = require('expect.js');
var util = require('util');

describe('データ', () => {
  describe('型とは何か', () => {
    it('整数の構成', (next) => {
      /* #@range_begin(integer_construction) */
      var succ = (n) => {
        return n + 1;
      };
      expect(
        succ(0)
      ).to.eql(
        1
      );
      expect(
        succ(succ(0))
      ).to.eql(
        2
      );
      /* #@range_end(integer_construction) */
      next();
    });
    // describe('型決定のタイミング', () => {
    //   it('NaNはエラーの場所を発見しにくくする', (next) => {
    //  var one = 1;
    //  var two = 2;
    //  var three = "three";
    //  var four = 4;
    //  expect(
    //    one * two * (three + four)
    //  ).to.eql(
    //    11   /* 1 * 2 + (3 + 4) = 10 を期待する */
    //  );
    //  next();
    //   });
    // }
  });
  describe('基本型', () => {
    it('未定義の変数', (next) => {
      /* #@range_begin(undefined_variable) */
      var variable;
      expect(
        variable
      ).to.be(
        undefined
      );
      /* #@range_end(undefined_variable) */
      next();
    });
    it('真理値型は不変である', (next) => {
      /* #@range_begin(truth_is_immutable) */
      var truth = true;
      expect(
        ! truth
      ).to.eql(
        false
      );
      expect(
        truth
      ).to.eql(
        truth
      );
      /* #@range_end(truth_is_immutable) */
      next();
    });
    it('数値型は不変である', (next) => {
      /* #@range_begin(number_is_immutable) */
      expect(
        1
      ).to.eql(
        1
      );
      var one = 1;
      one = one + 1;
      expect(
        one
      ).to.eql(
        2
      );
      /* #@range_end(number_is_immutable) */
      next();
    });
    it('文字列は不変である', (next) => {
      /* #@range_begin(string_is_immutable) */
      var str = "to be, or not to be";
      expect(
        str.toUpperCase()
      ).to.be(
        "TO BE, OR NOT TO BE"
      );
      expect(
        str
      ).to.be(
        "to be, or not to be"
      );
      /* #@range_end(string_is_immutable)  */
      next();
    });
    it('==比較演算子', (next) => {
      /* #@range_begin(equality_operator) */
      expect(
        null == undefined
      ).to.be(
        true
      );
      expect(
        false == ''
      ).to.be(
        true
      );
      expect(
        true == '1'
      ).to.be(
        true
      );
      expect(
        1 == '1'
      ).to.be(
        true
      );
      /* #@range_end(equality_operator)  */
      next();
    });
  });
  describe('合成型', () => {
    describe('オブジェクト型', () => {
      describe('アドレス帳の例', () => {
        it('オブジェクトのインスタンスの例', (next) => {
          /* #@range_begin(object_instance_example) */
          var object = {
            "No1": "Alan Turing",
            "No2": "Haskell Curry",
            "No3": "Alonzo Church"
          };
          /* #@range_end(object_instance_example) */
          /* #@range_begin(object_access) */
          expect(
            object.No1     // オブジェクト.キー記法
          ).to.be(
            "Alan Turing"
          );
          expect(
            object["No1"]  // オブジェクト[キー]記法
          ).to.be(
            "Alan Turing"
          );
          /* #@range_end(object_access) */
           next();
        });
        it('オブジェクトに関数をいれる', (next) => {
          /* ##@range_begin(object_can_embed_function) */
          var addressbook = {
            turing: {
              name: "Alan Turing",
              weight: 65,
              height: 175
            },
            BMI: (weight, height) => {
              expect(weight).to.be.a('number');
              expect(height).to.be.a('number');
              return weight / ((height / 100.0) * (height / 100.0));
            }
          };
          /* ##@range_end(object_can_embed_function) */
          /* ##@range_begin(embeded_function_invocation) */
          expect(
            addressbook.BMI(addressbook.turing.weight, addressbook.turing.height)
          ).to.within(21.0,22,0);
          /* ##@range_end(embeded_function_invocation) */
          // it('値に関数をいれる', (next) => {
          //   var natural = {
          //     zero: 0,
          //     succ: (n) => {
          //       return n + 1;
          //     }
          //   };
          //   expect(
          //     natural.succ(natural.zero)
          //   ).to.eql(
          //     1
          //   );
          next();
        });
        it('オブジェクト型によるアドレス帳の表現', (next) => {
          /* #@range_begin(addressbook_example) */
          var addressbook = {
            BMI: (weight, height) => {
              expect(weight).to.be.a('number');
              expect(height).to.be.a('number');
              return weight / ((height / 100.0) * (height / 100.0));
            },
            No1: {
              name: "Alan Turing",
              birthDay: "1912/6/23",
              weight: 62,
              height: 175
            },
            No2: {
              name: "Haskell Curry",
              birthDay: "1900/9/12",
              weight: 62,
              height: 180
            },
            No3: {
              name: "Alonzo Church",
              birthDay: "1903/6/14",
              weight: 75,
              height: 168
            }
          };
          expect(
            addressbook.No1.name
          ).to.eql(
            "Alan Turing"
          );
          expect(
            addressbook.BMI(
              addressbook.No1.weight,
              addressbook.No1.height)
          ).to.be.within(20.0,21.0); // within(A,B) は値が AとBのあいだにはいっていることをチェックする
          /* #@range_end(addressbook_example) */
          next();
        });
        it('オブジェクト型の入れ子', (next) => {
          /* ##@range_begin(object_can_embed_object) */
          var addressbook = {
            "No1": {
              "name": "Alan Turing",
              "birthDay": "1912/6/23"
            },
            "No2": {
              "name": "Haskell Curry",
              "birthDay": "1900/9/12"
            },
            "No3": {
              "name": "Alonzo Church",
              "birthDay": "1903/6/14"
            }
          };
          /* ##@range_end(object_can_embed_object) */
          // var expression = {
          //   add: {
          //     x: 1,
          //     y: {
          //       multiply: {
          //         x: 2,
          //         y: 3
          //       }
          //     }
          //   }
          // };
          // expect(
          //   expression.add.y.multiply.x
          // ).to.eql(
          //   2
          // );
          next();
        });
      });
      it('hasOwnPropertyでプロパティの有無を調べる', (next) => {
        /* ##@range_begin(hasOwnProperty_can_check_property) */
        var obj = {
          one: 1,
          two: 2
        };
        expect(
          obj.hasOwnProperty("one")
        ).to.eql(
          true
        );
        expect(
          obj.hasOwnProperty("three")
        ).to.eql(
          false
        );
        /* ##@range_end(hasOwnProperty_can_check_property)     */
        next();
      });
      it('for in で反復処理する', (next) => {
        /* ##@range_begin(for_in_object) */
        var obj = {
          one: 1,
          two: 2
        };
        var results = [];
        for (var key in obj) {
          results.push(obj[key])
        }
        expect(
          results
        ).to.eql(
          [1,2]
        );
        /* ##@range_end(for_in_object)     */
        next();
      });
    });
    describe('配列型', () => {
      it("forEach文", (next) => {
        /* #@range_begin(forEach_in_array) */
        var array = [1,2,3,4,5];
        var sum = 0;
        array.forEach((element) => {
          sum += element;
        });
        expect(
          sum
        ).to.eql(
          15
        );
        /* #@range_end(forEach_in_array) */
        next();
      });
      it("配列のソート", (next) => {
        /* #@range_begin(addressbook_example_in_array) */
        var addressbook = [ // 配列に要素を格納する
          {
            name: "Alan Turing",
            birthDay: "1912/6/23",
            weight: 62,
            height: 175
          },
          {
            name: "Haskell Curry",
            birthDay: "1900/9/12",
            weight: 62,
            height: 180
          },
          {
            name: "Alonzo Church",
            birthDay: "1903/6/14",
            weight: 75,
            height: 168
          }
        ];
        /* #@range_end(addressbook_example_in_array) */
        /* #@range_begin(sorting_array) */
        expect(
          addressbook.sort((onePerson,anotherPerson) => {
            return onePerson.name> anotherPerson.name;
          })
        ).to.eql(
          [
            {
              name: "Alan Turing",
              birthDay: "1912/6/23",
              weight: 62,
              height: 175
            },
            {
              name: "Alonzo Church",
              birthDay: "1903/6/14",
              weight: 75,
              height: 168
            },
            {
              name: "Haskell Curry",
              birthDay: "1900/9/12",
              weight: 62,
              height: 180
            }
          ]
        );
        /* #@range_end(sorting_array) */
        next();
      });
    });
    describe('抽象データ型', () => {
      it('抽象データ型としてのスタック', (next) => {
        var push = (n, stack) => {
          return [n].concat(stack);
        };
        var top = (stack) => {
          return stack[0];
        }
        var pop = (stack) => {
          return stack.slice(1,stack.length);
        };
        var empty = [];
        /* #@range_begin(stack_as_abstract_type) */
        expect(
          top(pop(pop(push(3,push(2,push(1,empty))))))
        ).to.eql(
          1
        );
        /* #@range_end(stack_as_abstract_type) */
        next();
      });
    });

    describe('関数型', () => {
      it('関数はオブジェクト型である', (next) => {
        /* #@range_begin(function_is_object_type) */
        var func = (n) => {
          return n;
        };
        expect(
          func.length
        ).to.be(
          1
        )
        expect(
          func.hasOwnProperty('name')
        ).to.be(
          true
        )
        /* #@range_end(function_is_object_type) */
        next();
      });
      it('関数はデータと類似している', (next) => {
        // trait env extends terms {
        //   abstract class Env {
        //     def apply[a](v : Var[a]): a
        //     def extend[a](v : Var[a], x : a) = new Env {
        //       def apply[b](w: Var[b]): b = w match {
        //         case _: v.type => x
        //         case _ =>  Env.this.apply(w)
        //       }}}
        //   object emptyEnv extends Env {
        //     def apply[a](x : Var[a]): a = throw new Error("not found : "+x.name)
        //   }
        // }
        /* #@range_begin(function_as_object) */
        var empty = (key) => {
          return undefined;
        };
        var get = (key, obj) => {
          return obj(key);
        };
        var set = (key, value, obj) => {
          return (key2) => {
            if(key === key2) {
              return value;
            } else {
              return get(key2,obj)
            }
          }
        };
        expect(
          get(1,set(1,"one",empty)) // {1: "one"}[1] => "one"
        ).to.eql(
          "one"
        )
        expect(
          get(2,set(2,"two",set(1,"one",empty)))  // {1: "one", 2: "two"}[2] => "two"
        ).to.eql(
          "two"
        )
        expect(
          get(1,set(2,"two",set(1,"one",empty)))  // {1: "one", 2: "two"}[1] => "one"
        ).to.eql(
          "one"
        )
        /* #@range_end(function_as_object) */
        next();
      });
    });
    describe('合成型の可変性', () => {
      it('配列は可変である', (next) => {
        /* #@range_begin(array_is_mutable) */
        var array = [0,1,2,3];
        array[0] = 7;
        expect(
          array
        ).not.to.eql(
          [0,1,2,3] // [7,1,2,3]
        )
        /* #@range_end(array_is_mutable) */
        next();
      });
      it('Array.reverseは破壊的操作である', (next) => {
        /* #@range_begin(destructive_reverse) */
        var array = [1,2,3,4,5];
        expect(
          array.reverse()
        ).to.eql(
          [5,4,3,2,1]
        );
        expect(
          array
        ).to.eql(
          [5,4,3,2,1] // array変数の中身が変更されている
        );
        /* #@range_end(destructive_reverse) */
        next();
      });
      it('非破壊的なreverse関数', (next) => {
        /* #@range_begin(immutable_reverse) */
        var reverse = (array) => {
          return array.reduce((accumulator, item) => {
            return [item].concat(accumulator);
          }, []);
        };
        var array = [0,1,2];
        expect(
          reverse(array)
        ).to.eql([2,1,0,]);
        expect(((_) => {
          var reversed = reverse(array);
          return array
        })()).to.be(
          array
        );
        /* #@range_end(immutable_reverse) */
        next();
      });
    });
  });
  describe('同値性', () => {
    describe('値としてのデータ', () => {
      it('基本型は値である', (next) => {
        /* #@range_begin(basic_type_is_value_type) */
        expect(
          1
        ).to.be(
          1
        )
        expect(
          true
        ).to.be(
          true
        )
        expect(
          "hello"
        ).to.be(
          "hello"
        )
        /* #@range_end(basic_type_is_value_type) */
        next();
      });
      it('合成型は参照である', (next) => {
        /* #@range_begin(complex_type_is_reference) */
        expect(
          [0,1,2,3]
        ).not.to.be(
          [0,1,2,3]
        )
        expect(
          {
            key: 1
          }
        ).not.to.be(
          {
            key: 1
          }
        )
        expect(
          ((_) => { return 1; })
        ).not.to.be(
          ((_) => { return 1; })
        )
        /* #@range_end(complex_type_is_reference) */
        next();
      });
    });
  });
  describe('変数', () => {
    describe('スコープ', () => {
      it('関数はスコープを分ける', (next) => {
        /* #@range_begin(function_scope) */
        var scope = "outer";
        var checkScope = (_) =>  {
          var scope = "inner";
          return scope;
        }
        expect(
          scope
        ).to.be(
          "outer"
        )
        expect(
          checkScope()
        ).to.be(
          "inner"
        )
        /* #@range_end(function_scope) */
        next();
      });
      it('内側のスコープから外側のスコープの参照', (next) => {
        /* #@range_begin(function_scope_nesting) */
        var scope = "outer";
        var func = (_) =>  {
          return scope;
        }
        expect(
          func()
        ).to.be(
          "outer"
        )
        // var outer = 1;
        // var f = (_) => {
        //   var middle = 2;
        //   var g = (_) => {
        //  var inner = 3;
        //  return outer + middle + inner;
        //   };
        //   return g();
        // };
        // expect(
        //   f()
        // ).to.be(
        //   6
        // )
        /* #@range_end(function_scope_nesting) */
        next();
      });
    });
    describe('環境と値', () => {
      it('変数のバインディング', (next) => {
        /* #@range_begin(variable_binding_value) */
        var bound = "バインドされた値";
        expect(
          bound
        ).to.be(
          "バインドされた値"
        );
        var free;
        expect(
          free
        ).to.be(
          undefined
        );
        /* #@range_end(variable_binding_value) */
        next();
      });
      it('関数の束縛変数', (next) => {
        /* #@range_begin(bound_variable_in_function) */
        var adder = (outerArgument,innerArgument) => {
          return outerArgument + innerArgument;
        };
        /* #@range_end(bound_variable_in_function) */
        expect(
          adder(2,3)
        ).to.be(
          5
        );
        next();
      });
      it('クロージャーの変数バインディング', (next) => {
        /* #@range_begin(free_variable_in_closure) */
        var adder = (outerArgument) => {
          return (innerArgument) => {
            return outerArgument + innerArgument;
          };
        }
        /* #@range_end(free_variable_in_closure) */
        expect(
          adder(2)(3)
        ).to.be(
          5
        );
        next();
      });
      it('環境の実装', (next) => {
        /* #@range_begin(environment_implemented) */
        // 空の環境
        var emptyEnv = (variable) => {
          return undefined;
        };
        // 変数名に対応する値を環境から取りだす
        var lookupEnv = (variable, env) => {
          return env(variable);
        };
        // 環境を拡張する
        var extendEnv = (variable, value, env) => {
          return (innerVariable) => {
            if(variable === innerVariable) {
              return value;
            } else {
              return lookupEnv(innerVariable,env)
            }
          }
        };
        /* #@range_end(environment_implemented) */
        /* #@range_begin(environment_implemented_usage) */
        expect(((_) => {
          // 空の辞書を作成する
          var initEnv = emptyEnv;
          // var a = 1 を実行して、辞書を拡張する
          var firstEnv = extendEnv("a", 1, initEnv);
          // var b = 3 を実行して、辞書を拡張する
          var secondEnv = extendEnv("b",3, firstEnv);
          // 辞書から b の値を参照する
          return lookupEnv("b",secondEnv);
        })()).to.eql(
          3
        );
        /* #@range_end(environment_implemented_usage) */
        /* #@range_begin(environment_implemented_shadowing_usage) */
        expect(((_) => {
          // 空の辞書を作成する
          var initEnv = emptyEnv;
          // var x = 1 を実行して、辞書を拡張する
          var xEnv = extendEnv("x", 1, initEnv);
          // var z = 2 を実行して、辞書を拡張する
          var zEnv = extendEnv("z", 2, xEnv);
          // 内部のスコープで var x = 3 を実行して、辞書を拡張する
          var xEnvInner = extendEnv("x",3, zEnv);
          // 内部のスコープで var y = 4 を実行して、辞書を拡張する
          var innerMostEnv = extendEnv("y",4, xEnvInner);
          // 一番内側のスコープを利用して x + y + z を計算する
          return lookupEnv("x",innerMostEnv) + lookupEnv("y",innerMostEnv) + lookupEnv("z",innerMostEnv) ;
        })()).to.eql(
          3 + 4 + 2
        );
        /* #@range_end(environment_implemented_shadowing_usage) */
        next();
      });
    });
    describe('記憶域と参照', () => {
      it('変数への代入', (next) => {
        /* #@range_begin(assign_to_variable) */
        var age = 29;
        expect(
          age
        ).to.be(
          29
        );
        age = 30;
        expect(
          age
        ).to.be(
          30
        );
        /* #@range_end(assign_to_variable) */
        next();
      });
      it('変数は参照を保持する', (next) => {
        /* #@range_begin(variables_hold_reference) */
        expect(() => {
          var x = 1;
          var y = x;
          y = 2;
          return x;
        }()).to.be(
          1
        )
        expect(() => {
          var x = 1;
          var y = x;
          x = 2;
          return y;
        }()).to.be(
          1
        )
        expect(() => {
          var x = [0,1,2,3];
          var y = x;
          return x === y;
        }()).to.be(
          true
        )
        /* #@range_end(variables_hold_reference) */
        next();
      });
    });
  });
});
