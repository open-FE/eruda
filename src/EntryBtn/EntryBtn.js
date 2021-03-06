import util from '../lib/util'
import Draggabilly from 'draggabilly'
import emitter from '../lib/emitter'

export default class EntryBtn extends util.Emitter
{
    constructor($parent)
    {
        super();

        this._style = util.evalCss(require('./EntryBtn.scss'));

        this._$parent = $parent;
        this._appendTpl();
        this._makeDraggable();
        this._bindEvent();
        this._registerListener();
    }
    hide() 
    {
        this._$el.hide();
    }
    show() 
    {
        this._$el.show();
    }
    destroy() 
    {
        util.evalCss.remove(this._style);
        this._unregisterListener();
        this._$el.remove();
    }
    _isOutOfRange() 
    {
        let cfg = this.config,
            pos = cfg.get('pos'),
            defPos = this._getDefPos();

        return pos.x > defPos.x + 10 ||
               pos.x < 0 ||
               pos.y < 0 ||
               pos.y > defPos.y + 10;
    }
    _registerListener() 
    {
        this._scaleListener = () => util.nextTick(() => 
        {
            if (this._isOutOfRange()) this._setPos();
        });
        emitter.on(emitter.SCALE, this._scaleListener)
    }
    _unregisterListener() 
    {
        emitter.off(emitter.SCALE, this._scaleListener);
    }
    _appendTpl()
    {
        let $parent = this._$parent;

        $parent.append(require('./EntryBtn.hbs')());
        this._$el = $parent.find('.eruda-entry-btn');
    }
    _setPos(orientationChanged)
    {
        let cfg = this.config,
            pos = cfg.get('pos'),
            defPos = this._getDefPos();

        if (this._isOutOfRange() ||
            !cfg.get('rememberPos') ||
            orientationChanged) pos = defPos;

        this._$el.css({
            left: pos.x,
            top: pos.y
        });

        cfg.set('pos', pos);
    }
    _bindEvent()
    {
        let draggabilly = this._draggabilly,
            $el = this._$el;

        draggabilly.on('staticClick', () => this.emit('click'))
                   .on('dragStart', () => $el.addClass('eruda-active'));

        draggabilly.on('dragEnd', () =>
        {
            let cfg = this.config;

            if (cfg.get('rememberPos'))
            {
                cfg.set('pos', {
                    x: util.pxToNum(this._$el.css('left')),
                    y: util.pxToNum(this._$el.css('top'))
                });
            }

            $el.rmClass('eruda-active');
        });

        util.orientation.on('change', () => this._setPos(true));
        window.addEventListener('resize', () => this._setPos());
    }
    _makeDraggable()
    {
        this._draggabilly = new Draggabilly(this._$el.get(0), {containment: true});
    }
    initCfg(settings)
    {
        let cfg = this.config = util.createCfg('home-button');

        cfg.set(util.defaults(cfg.get(), {
            rememberPos: true,
            pos: this._getDefPos()
        }));

        settings.separator()
                .switch(cfg, 'rememberPos', 'Remember Entry Button Position');

        this._setPos();
    }
    _getDefPos() 
    {
        let minWidth = this._$el.get(0).offsetWidth + 10;

        return {
            x: window.innerWidth - minWidth,
            y: window.innerHeight - minWidth
        };
    } 
}
