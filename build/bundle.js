
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\FormataAbnt\FormataAbnt.svelte generated by Svelte v3.38.3 */

    const file$2 = "src\\FormataAbnt\\FormataAbnt.svelte";

    // (124:2) {#if show}
    function create_if_block$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Copiado para a área de transferência";
    			attr_dev(span, "class", "svelte-13fge9i");
    			add_location(span, file$2, 124, 4, 2542);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(124:2) {#if show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let label1;
    	let t2;
    	let input1;
    	let t3;
    	let label2;
    	let t4;
    	let input2;
    	let t5;
    	let label3;
    	let t6;
    	let input3;
    	let t7;
    	let button;
    	let t9;
    	let t10;
    	let input4;
    	let mounted;
    	let dispose;
    	let if_block = /*show*/ ctx[5] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label0 = element("label");
    			t0 = text("Link:\r\n    ");
    			input0 = element("input");
    			t1 = space();
    			label1 = element("label");
    			t2 = text("Título da página:\r\n    ");
    			input1 = element("input");
    			t3 = space();
    			label2 = element("label");
    			t4 = text("Publicado em:\r\n    ");
    			input2 = element("input");
    			t5 = space();
    			label3 = element("label");
    			t6 = text("Acessado em:\r\n    ");
    			input3 = element("input");
    			t7 = space();
    			button = element("button");
    			button.textContent = "OK";
    			t9 = space();
    			if (if_block) if_block.c();
    			t10 = space();
    			input4 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "link");
    			attr_dev(input0, "class", "svelte-13fge9i");
    			add_location(input0, file$2, 103, 4, 2057);
    			attr_dev(label0, "for", "link");
    			attr_dev(label0, "class", "svelte-13fge9i");
    			add_location(label0, file$2, 101, 2, 2022);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "titulo");
    			attr_dev(input1, "class", "svelte-13fge9i");
    			add_location(input1, file$2, 108, 4, 2173);
    			attr_dev(label1, "for", "titulo");
    			attr_dev(label1, "class", "svelte-13fge9i");
    			add_location(label1, file$2, 106, 2, 2124);
    			attr_dev(input2, "type", "date");
    			attr_dev(input2, "id", "publicacao");
    			attr_dev(input2, "class", "svelte-13fge9i");
    			add_location(input2, file$2, 113, 4, 2293);
    			attr_dev(label2, "for", "publicacao");
    			attr_dev(label2, "class", "svelte-13fge9i");
    			add_location(label2, file$2, 111, 2, 2244);
    			attr_dev(input3, "type", "date");
    			attr_dev(input3, "id", "acesso");
    			attr_dev(input3, "class", "svelte-13fge9i");
    			add_location(input3, file$2, 118, 4, 2416);
    			attr_dev(label3, "for", "acesso");
    			attr_dev(label3, "class", "svelte-13fge9i");
    			add_location(label3, file$2, 116, 2, 2372);
    			attr_dev(button, "class", "svelte-13fge9i");
    			add_location(button, file$2, 121, 2, 2487);
    			attr_dev(div, "id", "conteudo");
    			attr_dev(div, "class", "svelte-13fge9i");
    			add_location(div, file$2, 100, 0, 1999);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "id", "sumiu");
    			attr_dev(input4, "class", "svelte-13fge9i");
    			add_location(input4, file$2, 128, 0, 2612);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label0);
    			append_dev(label0, t0);
    			append_dev(label0, input0);
    			set_input_value(input0, /*link*/ ctx[0]);
    			append_dev(div, t1);
    			append_dev(div, label1);
    			append_dev(label1, t2);
    			append_dev(label1, input1);
    			set_input_value(input1, /*titulo*/ ctx[1]);
    			append_dev(div, t3);
    			append_dev(div, label2);
    			append_dev(label2, t4);
    			append_dev(label2, input2);
    			set_input_value(input2, /*publicacao*/ ctx[2]);
    			append_dev(div, t5);
    			append_dev(div, label3);
    			append_dev(label3, t6);
    			append_dev(label3, input3);
    			set_input_value(input3, /*acesso*/ ctx[3]);
    			append_dev(div, t7);
    			append_dev(div, button);
    			append_dev(div, t9);
    			if (if_block) if_block.m(div, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, input4, anchor);
    			/*input4_binding*/ ctx[11](input4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[9]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[10]),
    					listen_dev(button, "click", /*ok*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*link*/ 1 && input0.value !== /*link*/ ctx[0]) {
    				set_input_value(input0, /*link*/ ctx[0]);
    			}

    			if (dirty & /*titulo*/ 2 && input1.value !== /*titulo*/ ctx[1]) {
    				set_input_value(input1, /*titulo*/ ctx[1]);
    			}

    			if (dirty & /*publicacao*/ 4) {
    				set_input_value(input2, /*publicacao*/ ctx[2]);
    			}

    			if (dirty & /*acesso*/ 8) {
    				set_input_value(input3, /*acesso*/ ctx[3]);
    			}

    			if (/*show*/ ctx[5]) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(input4);
    			/*input4_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function data(date) {
    	const mes = {
    		1: "jan.",
    		2: "fev.",
    		3: "mar.",
    		4: "abr.",
    		5: "maio",
    		6: "jun.",
    		7: "jul.",
    		8: "ago.",
    		9: "set.",
    		10: "out.",
    		11: "nov.",
    		12: "dez."
    	};

    	return `${Number(date.split("-")[2])} ${mes[Number(date.split("-")[1])]} ${Number(date.split("-")[0])}`;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FormataAbnt", slots, []);
    	const hoje = new Date();
    	const hojestr = `${hoje.getYear() + 1900}-${(hoje.getMonth() + 1).toString().padStart("2", "0")}-${hoje.getDate().toString().padStart("2", "0")}`;
    	let link = "";
    	let titulo = "";
    	let publicacao = hojestr;
    	let acesso = hojestr;
    	let resultado = "";
    	let show = false;

    	function ok() {
    		$$invalidate(5, show = true);
    		$$invalidate(4, resultado.value = `${titulo}. [S. l.], ${data(publicacao)}. Disponível em: ${link}. Acesso em: ${data(acesso)}.`, resultado);
    		resultado.select();
    		resultado.setSelectionRange(0, 99999);
    		document.execCommand("copy");
    		$$invalidate(0, link = "");
    		$$invalidate(1, titulo = "");
    		$$invalidate(2, publicacao = hojestr);
    		$$invalidate(3, acesso = hojestr);
    		setTimeout(() => $$invalidate(5, show = false), 3000);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FormataAbnt> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		link = this.value;
    		$$invalidate(0, link);
    	}

    	function input1_input_handler() {
    		titulo = this.value;
    		$$invalidate(1, titulo);
    	}

    	function input2_input_handler() {
    		publicacao = this.value;
    		$$invalidate(2, publicacao);
    	}

    	function input3_input_handler() {
    		acesso = this.value;
    		$$invalidate(3, acesso);
    	}

    	function input4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			resultado = $$value;
    			$$invalidate(4, resultado);
    		});
    	}

    	$$self.$capture_state = () => ({
    		hoje,
    		hojestr,
    		link,
    		titulo,
    		publicacao,
    		acesso,
    		resultado,
    		show,
    		data,
    		ok
    	});

    	$$self.$inject_state = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    		if ("titulo" in $$props) $$invalidate(1, titulo = $$props.titulo);
    		if ("publicacao" in $$props) $$invalidate(2, publicacao = $$props.publicacao);
    		if ("acesso" in $$props) $$invalidate(3, acesso = $$props.acesso);
    		if ("resultado" in $$props) $$invalidate(4, resultado = $$props.resultado);
    		if ("show" in $$props) $$invalidate(5, show = $$props.show);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		link,
    		titulo,
    		publicacao,
    		acesso,
    		resultado,
    		show,
    		ok,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_binding
    	];
    }

    class FormataAbnt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormataAbnt",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\FormataCodigo\FormataCodigo.svelte generated by Svelte v3.38.3 */

    const file$1 = "src\\FormataCodigo\\FormataCodigo.svelte";

    // (109:4) {#if show}
    function create_if_block$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Copiado para a área de transferência";
    			attr_dev(span, "class", "svelte-1t7hlp8");
    			add_location(span, file$1, 109, 6, 2269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(109:4) {#if show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div3;
    	let div2;
    	let h3;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let div0;
    	let label;
    	let t4;
    	let input1;
    	let t5;
    	let button;
    	let t7;
    	let t8;
    	let input2;
    	let mounted;
    	let dispose;
    	let if_block = /*show*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Insira o título abaixo e pressione OK:";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Indentação:";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			button = element("button");
    			button.textContent = "OK";
    			t7 = space();
    			if (if_block) if_block.c();
    			t8 = space();
    			input2 = element("input");
    			attr_dev(h3, "class", "svelte-1t7hlp8");
    			add_location(h3, file$1, 97, 4, 1892);
    			attr_dev(input0, "id", "entrada");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-1t7hlp8");
    			add_location(input0, file$1, 99, 4, 1947);
    			attr_dev(label, "for", "indentacao");
    			add_location(label, file$1, 103, 8, 2062);
    			attr_dev(input1, "id", "indentacao");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "svelte-1t7hlp8");
    			add_location(input1, file$1, 104, 8, 2115);
    			attr_dev(div0, "id", "indent");
    			attr_dev(div0, "class", "svelte-1t7hlp8");
    			add_location(div0, file$1, 102, 6, 2035);
    			attr_dev(button, "class", "svelte-1t7hlp8");
    			add_location(button, file$1, 106, 6, 2200);
    			attr_dev(div1, "id", "controle");
    			attr_dev(div1, "class", "svelte-1t7hlp8");
    			add_location(div1, file$1, 101, 4, 2008);
    			attr_dev(div2, "id", "conteudo");
    			attr_dev(div2, "class", "svelte-1t7hlp8");
    			add_location(div2, file$1, 96, 2, 1867);
    			attr_dev(div3, "id", "corpo");
    			add_location(div3, file$1, 95, 0, 1847);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "sumiu");
    			attr_dev(input2, "class", "svelte-1t7hlp8");
    			add_location(input2, file$1, 114, 0, 2351);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h3);
    			append_dev(div2, t1);
    			append_dev(div2, input0);
    			set_input_value(input0, /*campo*/ ctx[0]);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(div0, t4);
    			append_dev(div0, input1);
    			set_input_value(input1, /*indentacao*/ ctx[1]);
    			append_dev(div1, t5);
    			append_dev(div1, button);
    			append_dev(div2, t7);
    			if (if_block) if_block.m(div2, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, input2, anchor);
    			/*input2_binding*/ ctx[7](input2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
    					listen_dev(button, "click", /*ok*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*campo*/ 1 && input0.value !== /*campo*/ ctx[0]) {
    				set_input_value(input0, /*campo*/ ctx[0]);
    			}

    			if (dirty & /*indentacao*/ 2 && to_number(input1.value) !== /*indentacao*/ ctx[1]) {
    				set_input_value(input1, /*indentacao*/ ctx[1]);
    			}

    			if (/*show*/ ctx[3]) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(input2);
    			/*input2_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FormataCodigo", slots, []);
    	let campo = "";
    	let indentacao = 2;
    	let resultado;
    	let show = false;

    	async function ok() {
    		$$invalidate(3, show = true);
    		const titulo = campo.trim().toUpperCase();
    		const area = 80 - indentacao;
    		const texto = titulo.length + 6;
    		let inicio = parseInt((area - texto) / 2);
    		if (area % 2 && !titulo.length % 2) ++inicio;
    		const fim = area - texto - inicio;
    		const msg = `/*${("*").repeat(inicio)} ${titulo} ${("*").repeat(fim)}*/`;
    		$$invalidate(2, resultado.value = msg, resultado);
    		resultado.select();
    		resultado.setSelectionRange(0, 99999);
    		document.execCommand("copy");
    		$$invalidate(0, campo = "");
    		setTimeout(() => $$invalidate(3, show = false), 3000);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FormataCodigo> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		campo = this.value;
    		$$invalidate(0, campo);
    	}

    	function input1_input_handler() {
    		indentacao = to_number(this.value);
    		$$invalidate(1, indentacao);
    	}

    	function input2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			resultado = $$value;
    			$$invalidate(2, resultado);
    		});
    	}

    	$$self.$capture_state = () => ({ campo, indentacao, resultado, show, ok });

    	$$self.$inject_state = $$props => {
    		if ("campo" in $$props) $$invalidate(0, campo = $$props.campo);
    		if ("indentacao" in $$props) $$invalidate(1, indentacao = $$props.indentacao);
    		if ("resultado" in $$props) $$invalidate(2, resultado = $$props.resultado);
    		if ("show" in $$props) $$invalidate(3, show = $$props.show);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		campo,
    		indentacao,
    		resultado,
    		show,
    		ok,
    		input0_input_handler,
    		input1_input_handler,
    		input2_binding
    	];
    }

    class FormataCodigo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormataCodigo",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.3 */
    const file = "src\\App.svelte";

    // (32:26) 
    function create_if_block_1(ctx) {
    	let formataabnt;
    	let current;
    	formataabnt = new FormataAbnt({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(formataabnt.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(formataabnt, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formataabnt.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formataabnt.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(formataabnt, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(32:26) ",
    		ctx
    	});

    	return block;
    }

    // (30:2) {#if escolha === 1}
    function create_if_block(ctx) {
    	let formatacodigo;
    	let current;
    	formatacodigo = new FormataCodigo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(formatacodigo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(formatacodigo, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formatacodigo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formatacodigo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(formatacodigo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(30:2) {#if escolha === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let select;
    	let option0;
    	let option1;
    	let t2;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*escolha*/ ctx[0] === 1) return 0;
    		if (/*escolha*/ ctx[0] === 2) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Formata Link para ABNT";
    			option1 = element("option");
    			option1.textContent = "Gera Comentário de Código";
    			t2 = space();
    			if (if_block) if_block.c();
    			option0.__value = 2;
    			option0.value = option0.__value;
    			attr_dev(option0, "class", "svelte-hp2rqe");
    			add_location(option0, file, 25, 4, 395);
    			option1.__value = 1;
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-hp2rqe");
    			add_location(option1, file, 26, 4, 449);
    			attr_dev(select, "class", "svelte-hp2rqe");
    			if (/*escolha*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[1].call(select));
    			add_location(select, file, 24, 2, 361);
    			attr_dev(div, "id", "corpo");
    			attr_dev(div, "class", "svelte-hp2rqe");
    			add_location(div, file, 23, 0, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			select_option(select, /*escolha*/ ctx[0]);
    			append_dev(div, t2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*escolha*/ 1) {
    				select_option(select, /*escolha*/ ctx[0]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let escolha = 2;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		escolha = select_value(this);
    		$$invalidate(0, escolha);
    	}

    	$$self.$capture_state = () => ({ FormataAbnt, FormataCodigo, escolha });

    	$$self.$inject_state = $$props => {
    		if ("escolha" in $$props) $$invalidate(0, escolha = $$props.escolha);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [escolha, select_change_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
